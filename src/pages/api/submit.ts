import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const formData = await request.formData();
    // @ts-ignore
    const { DB } = locals.runtime.env;
    
    // 获取客户端 IP (Cloudflare 标头)
    const clientIP = request.headers.get("CF-Connecting-IP") || "127.0.0.1";

    // ==========================================
    // 1. 限流逻辑 (1小时内只能提交6次)
    // ==========================================
    // 清理 1 小时前的旧日志
    await DB.prepare("DELETE FROM submission_logs WHERE created_at < datetime('now', '-1 hour')").run();
    
    // 查询当前 IP 在过去 1 小时内的提交次数
    const limitCheck = await DB.prepare("SELECT count(*) as count FROM submission_logs WHERE ip = ?").bind(clientIP).first();
    
    if (limitCheck && limitCheck.count >= 6) {
        return new Response(JSON.stringify({ success: false, error: 'RATE_LIMIT_EXCEEDED' }), { status: 429 });
    }

    // ==========================================
    // 2. 获取参数 & 域名清洗
    // ==========================================
    let rawDomain = formData.get("domain") as string;
    const title = formData.get("title") as string;
    const desc = formData.get("desc") as string;
    const owner = formData.get("owner") as string;
    const email = formData.get("email") as string;
    const userLogo = formData.get("logo") as string;
    const customCode = formData.get("custom_code") as string;

    const cleanDomain = rawDomain.replace(/^https?:\/\//, '').replace(/\/+$/, '').trim();

    // ==========================================
    // 3. 查重 & 黑名单拦截
    // ==========================================
    const existingSite = await DB.prepare("SELECT id, status FROM sites WHERE domain = ?").bind(cleanDomain).first();
    
    if (existingSite) {
        // 如果状态是 rejected (黑名单)，拦截并提示联系邮箱
        if (existingSite.status === 'rejected') {
            return new Response(JSON.stringify({ success: false, error: 'BLACKLISTED' }), { status: 403 });
        }
        return new Response(JSON.stringify({ success: false, error: 'DUPLICATE_DOMAIN' }), { status: 409 });
    }

    // ==========================================
    // 4. 审核逻辑判断
    // 规则：如果没有填 LOGO 或者 没有填 描述，则进入审核模式
    // ==========================================
    let status = 'active';
    let isHidden = 0;
    // 如果 logo 为空 或者 desc 为空，进入 pending 状态，且默认隐藏
    if (!userLogo.trim() || !desc.trim()) {
        status = 'pending';
        isHidden = 1;
    }

    // ==========================================
    // 5. 备案号生成 (保持原有逻辑)
    // ==========================================
    let icpCode = "";
    if (customCode && customCode.length === 8 && customCode.startsWith("2025")) {
        const check = await DB.prepare("SELECT id FROM sites WHERE icp_code = ?").bind(customCode).first();
        if (check) return new Response(JSON.stringify({ success: false, error: 'CODE_TAKEN' }), { status: 409 });
        icpCode = customCode;
    } else {
        const year = new Date().getFullYear();
        for(let i=0; i<3; i++) {
            const randomNum = Math.floor(1000 + Math.random() * 9000); 
            const tryCode = `${year}${randomNum}`;
            const check = await DB.prepare("SELECT id FROM sites WHERE icp_code = ?").bind(tryCode).first();
            if(!check) { icpCode = tryCode; break; }
        }
        if(!icpCode) icpCode = `${year}${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // ==========================================
    // 6. 资源处理 & 写入
    // ==========================================
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let authCode = '';
    for (let i = 0; i < 8; i++) authCode += chars.charAt(Math.floor(Math.random() * chars.length));

    // Logo 即使为空，我们暂时也给它生成一个默认的，但状态依然是 pending
    const logo_url = userLogo.trim() !== "" ? userLogo : `https://api.iowen.cn/favicon/${cleanDomain}.png`;
    
    const fullUrl = `https://${cleanDomain}`;
    const encodedUrl = encodeURIComponent(fullUrl);
    const snapshot_url = `https://s0.wordpress.com/mshots/v1/${encodedUrl}?w=800&quality=90`;
    
    // 插入站点数据
    await DB.prepare(
      `INSERT INTO sites (domain, title, description, owner, email, logo_url, snapshot_url, icp_code, auth_code, status, is_hidden) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(cleanDomain, title, desc, owner, email, logo_url, snapshot_url, icpCode, authCode, status, isHidden).run();

    // 记录提交日志 (用于限流)
    await DB.prepare("INSERT INTO submission_logs (ip) VALUES (?)").bind(clientIP).run();

    return new Response(JSON.stringify({ 
        success: true, 
        code: icpCode,
        auth: authCode,
        status: status // 返回状态给前端判断显示什么提示
    }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Database Error" }), { status: 500 });
  }
};