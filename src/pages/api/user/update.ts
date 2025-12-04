import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const formData = await request.formData();
    
    // 身份标识
    const domain = formData.get("domain") as string;
    const icp = formData.get("icp") as string;
    const authCode = formData.get("auth_code") as string; // 改为 auth_code

    // 要修改的内容
    const title = formData.get("title");
    const owner = formData.get("owner");
    const desc = formData.get("desc");
    const logo = formData.get("logo");
    const snapshot_url = formData.get("snapshot_url"); 

    // @ts-ignore
    const { DB } = locals.runtime.env;

    // 1. 验证身份 (Domain + ICP + AuthCode)
    const check = await DB.prepare(
      "SELECT id FROM sites WHERE domain = ? AND icp_code = ? AND auth_code = ?"
    ).bind(domain, icp, authCode).first();

    if (!check) {
      return new Response(JSON.stringify({ success: false, error: 'UNAUTHORIZED' }), { status: 401 });
    }

    // 2. 执行更新
    await DB.prepare(
      `UPDATE sites 
       SET title = ?, owner = ?, description = ?, logo_url = ?, snapshot_url = ?
       WHERE id = ?`
    ).bind(title, owner, desc, logo, snapshot_url, check.id).run();

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (e) {
    return new Response(JSON.stringify({ error: "Update Failed" }), { status: 500 });
  }
};