import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  if (!cookies.get("admin_session")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const formData = await request.formData();
  const action = formData.get("action");
  // @ts-ignore
  const { DB } = locals.runtime.env;

  try {
    // 1. 删除
    if (action === "delete") {
      const id = formData.get("id");
      await DB.prepare("DELETE FROM sites WHERE id = ?").bind(id).run();
      return new Response(JSON.stringify({ success: true }));
    }

    // 2. 切换显示/隐藏
    if (action === "toggle_hide") {
      const id = formData.get("id");
      const currentHidden = formData.get("current_val"); 
      const newValue = currentHidden === "1" ? 0 : 1;
      await DB.prepare("UPDATE sites SET is_hidden = ? WHERE id = ?").bind(newValue, id).run();
      return new Response(JSON.stringify({ success: true }));
    }

    // 3. 审核通过
    if (action === "approve") {
      const id = formData.get("id");
      await DB.prepare("UPDATE sites SET status = 'active', is_hidden = 0 WHERE id = ?").bind(id).run();
      return new Response(JSON.stringify({ success: true }));
    }

    // 4. 驳回/拉黑
    if (action === "reject") {
      const id = formData.get("id");
      await DB.prepare("UPDATE sites SET status = 'rejected', is_hidden = 1 WHERE id = ?").bind(id).run();
      return new Response(JSON.stringify({ success: true }));
    }

    // 5. 编辑/修改 (核心修改点)
    if (action === "update") {
      const id = formData.get("id");
      const title = formData.get("title");
      const domain = formData.get("domain");
      const owner = formData.get("owner");
      const icp = formData.get("icp");
      const logo = formData.get("logo");
      const snapshot = formData.get("snapshot");
      const authCode = formData.get("auth_code");
      
      // 新增字段
      const email = formData.get("email");
      const date = formData.get("date"); // created_at
      
      await DB.prepare(
        `UPDATE sites 
         SET title = ?, domain = ?, owner = ?, icp_code = ?, logo_url = ?, snapshot_url = ?, auth_code = ?, email = ?, created_at = ?
         WHERE id = ?`
      ).bind(title, domain, owner, icp, logo, snapshot, authCode, email, date, id).run();
      
      return new Response(JSON.stringify({ success: true }));
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });

  } catch (e) {
    // @ts-ignore
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};