import { MAIN_ORIGIN, SYSTEM_ORIGIN } from "@/lib/seo";
import { getServices } from "@/components/system-site/catalog";

// The public pages of whichever site asked: the gateway on www, the System website on system.
export async function GET(request: Request) {
  const host = request.headers.get("host") || "";
  let urls: string[];
  if (host.startsWith("system.")) {
    const services = await getServices().catch(() => []);
    urls = ["/", "/services", "/packages", "/contact", "/register", "/privacy", "/terms", ...services.map((s) => "/services/" + s.id)].map((p) => SYSTEM_ORIGIN + p);
  } else {
    urls = [MAIN_ORIGIN + "/"];
  }
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}\n</urlset>\n`;
  return new Response(body, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
