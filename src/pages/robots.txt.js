export function GET() {
  const pub = process.env.SITE_PUBLIC === 'true';
  const url = (process.env.SITE_URL || 'https://mariaplan.nu').replace(/\/$/, '');
  const body = pub ? `User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
