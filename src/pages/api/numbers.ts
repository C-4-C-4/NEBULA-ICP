import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const keyword = url.searchParams.get("q") || "";
  
  // @ts-ignore
  const { DB } = locals.runtime.env;

  try {
    // 1. 获取所有已占用的号码 (只取 2025 开头的，减少数据量)
    const result = await DB.prepare("SELECT icp_code FROM sites WHERE icp_code LIKE '2025%'").all();
    // 显式断言 r 为 any，防止 TS 报错
    const usedCodes = new Set(result.results.map((r: any) => r.icp_code));

    // === 修复点：显式指定数组类型为 string[] ===
    const availableCodes: string[] = [];
    const prefix = "2025";
    const limit = 24; // 一次返回的数量

    // 2. 如果有搜索关键词 (比如搜 "888")
    if (keyword) {
        // 暴力遍历 0000-9999 寻找匹配项
        for (let i = 0; i < 10000; i++) {
            const suffix = i.toString().padStart(4, '0');
            const fullCode = prefix + suffix;
            
            // 匹配逻辑：包含关键词，且未被占用
            if (fullCode.includes(keyword) && !usedCodes.has(fullCode)) {
                availableCodes.push(fullCode);
            }
            if (availableCodes.length >= limit) break;
        }
    } 
    // 3. 如果没有搜索 (随机推荐模式)
    else {
        let attempts = 0;
        // 限制尝试次数防止死循环
        while (availableCodes.length < limit && attempts < 2000) {
            const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            const fullCode = prefix + randomSuffix;
            
            if (!usedCodes.has(fullCode) && !availableCodes.includes(fullCode)) {
                availableCodes.push(fullCode);
            }
            attempts++;
        }
        // 排序一下更好看
        availableCodes.sort();
    }

    return new Response(JSON.stringify({ codes: availableCodes }), { status: 200 });

  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "DB Error" }), { status: 500 });
  }
};