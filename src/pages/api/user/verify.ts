import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const formData = await request.formData();
    const domain = formData.get("domain") as string;
    const icp = formData.get("icp") as string;
    const authCode = formData.get("auth_code") as string; // 改为获取 auth_code

    // @ts-ignore
    const { DB } = locals.runtime.env;

    // 修改：验证三要素 (Domain + ICP + AuthCode)
    const site = await DB.prepare(
      "SELECT * FROM sites WHERE domain = ? AND icp_code = ? AND auth_code = ?"
    ).bind(domain, icp, authCode).first();

    if (!site) {
      return new Response(JSON.stringify({ success: false, error: 'INVALID_CREDENTIALS' }), { status: 401 });
    }

    return new Response(JSON.stringify({ success: true, data: site }), { status: 200 });

  } catch (e) {
    return new Response(JSON.stringify({ error: "Database Error" }), { status: 500 });
  }
};