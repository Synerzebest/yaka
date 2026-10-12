import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseConfig } from '@/lib/supabase/config';
import { isStudentPath, safeDestination } from '@/lib/navigation';

export async function proxy(request: NextRequest) {
  const config = supabaseConfig();
  let response = NextResponse.next({ request });
  let authenticated = false;
  if (config) {
    const supabase = createServerClient(config.url, config.key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(values) {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    const { data } = await supabase.auth.getClaims();
    authenticated = !!data?.claims;
  }
  if (
    !authenticated &&
    (isStudentPath(request.nextUrl.pathname) || ['/compte', '/bienvenue'].includes(request.nextUrl.pathname))
  ) {
    const url = new URL('/connexion', request.url);
    url.searchParams.set('next', safeDestination(request.nextUrl.pathname + request.nextUrl.search));
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
    response = redirect;
  }
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/cours/:path*',
    '/exercices/:path*',
    '/progression/:path*',
    '/badges/:path*',
    '/connexion',
    '/compte',
    '/bienvenue',
    '/autorisation-parentale',
    '/mot-de-passe',
    '/auth/:path*',
  ],
};
