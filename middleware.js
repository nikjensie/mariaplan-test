// Vercel Routing Middleware: lösenordsskydd så länge sidan är ett konceptförslag.
// Sätt SITE_PASSWORD för att slå på skyddet. SITE_PUBLIC=true släpper det.
export const config = { matcher: '/((?!favicon.svg).*)' };

export default function middleware(request) {
  if (process.env.SITE_PUBLIC === 'true') return;
  const password = process.env.SITE_PASSWORD;
  if (!password) return;
  const auth = request.headers.get('authorization') || '';
  if (auth.startsWith('Basic ')) {
    try {
      const [, pass] = atob(auth.slice(6)).split(':');
      if (pass === password) return;
    } catch {}
  }
  return new Response('Lösenord krävs', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Mariaplan koncept", charset="UTF-8"',
      'X-Robots-Tag': 'noindex, nofollow',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
