import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const formData = await request.formData();
  const password = formData.get("password") as string;
  
  // @ts-ignore
  const envPassword = locals.runtime.env.ADMIN_PASSWORD;

  if (password === envPassword) {
    // 密码正确，设置 Cookie (有效期 1 天)
    cookies.set("admin_session", "true", { 
      path: "/", 
      maxAge: 60 * 60 * 24,
      httpOnly: true 
    });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  return new Response(JSON.stringify({ success: false }), { status: 401 });
};