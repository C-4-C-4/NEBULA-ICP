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

    // 2. 切换显示/隐藏 (仅对非黑名单有效)
    if (action === "toggle_hide") {
      const id = formData.get("id");
      const currentHidden = formData.get("current_val"); 
      const newValue = currentHidden === "1" ? 0 : 1;
      await DB.prepare("UPDATE sites SET is_hidden = ? WHERE id = ?").bind(newValue, id).run();
      return new Response(JSON.stringify({ success: true }));
    }

    // 3. 审核通过 (Approve)
    if (action === "approve") {
      const id = formData.get("id");
      // 将状态改为 active，并显示出来
      await DB.prepare("UPDATE sites SET status = 'active', is_hidden = 0 WHERE id = ?").bind(id).run();
      return new Response(JSON.stringify({ success: true }));
    }

    // 4. 驳回/拉黑 (Reject)
    if (action === "reject") {
      const id = formData.get("id");
      // 将状态改为 rejected (黑名单状态)，并隐藏
      await DB.prepare("UPDATE sites SET status = 'rejected', is_hidden = 1 WHERE id = ?").bind(id).run();
      return new Response(JSON.stringify({ success: true }));
    }

    // 5. 编辑/修改
    if (action === "update") {
      const id = formData.get("id");
      const title = formData.get("title");
      const domain = formData.get("domain");
      const owner = formData.get("owner");
      const icp = formData.get("icp");
      const logo = formData.get("logo");
      const snapshot = formData.get("snapshot");
      const authCode = formData.get("auth_code");
      
      await DB.prepare(
        `UPDATE sites 
         SET title = ?, domain = ?, owner = ?, icp_code = ?, logo_url = ?, snapshot_url = ?, auth_code = ? 
         WHERE id = ?`
      ).bind(title, domain, owner, icp, logo, snapshot, authCode, id).run();
      
      return new Response(JSON.stringify({ success: true }));
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });

  } catch (e) {
    // @ts-ignore
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};