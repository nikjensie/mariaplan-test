export function GET() {
  const url = (process.env.SITE_URL || 'https://mariaplan.nu').replace(/\/$/, '');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url}/</loc></url></urlset>\n`, { headers: { 'Content-Type': 'application/xml' } });
}
