import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ cookies }) => {
  // 删除 Cookie
  cookies.delete("admin_session", { path: "/" });
  
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};