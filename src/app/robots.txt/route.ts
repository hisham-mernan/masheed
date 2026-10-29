import { MAIN_ORIGIN, SYSTEM_ORIGIN } from "@/lib/seo";

// One app serves both public sites, so robots.txt names the sitemap of the host that asked.
export function GET(request: Request) {
  const host = request.headers.get("host") || "";
  const origin = host.startsWith("system.") ? SYSTEM_ORIGIN : MAIN_ORIGIN;
  const body = ["User-agent: *", "Allow: /", "Disallow: /dashboard", "Disallow: /api/", "Disallow: /meet/", "", `Sitemap: ${origin}/sitemap.xml`, ""].join("\n");
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
