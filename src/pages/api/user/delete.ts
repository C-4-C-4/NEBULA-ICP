import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const formData = await request.formData();
    
    const domain = formData.get("domain") as string;
    const icp = formData.get("icp") as string;
    const authCode = formData.get("auth_code") as string;

    // @ts-ignore
    const { DB } = locals.runtime.env;

    // 1. 严格验证三要素
    const site = await DB.prepare(
      "SELECT id FROM sites WHERE domain = ? AND icp_code = ? AND auth_code = ?"
    ).bind(domain, icp, authCode).first();

    if (!site) {
      return new Response(JSON.stringify({ success: false, error: 'INVALID_CREDENTIALS' }), { status: 401 });
    }

    // 2. 执行物理删除
    await DB.prepare("DELETE FROM sites WHERE id = ?").bind(site.id).run();

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (e) {
    return new Response(JSON.stringify({ error: "Database Error" }), { status: 500 });
  }
};