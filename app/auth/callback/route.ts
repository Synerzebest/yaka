import { NextResponse, type NextRequest } from 'next/server';
import { safeDestination } from '@/lib/navigation';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const destination =
    request.nextUrl.searchParams.get('next') === '/mot-de-passe'
      ? '/mot-de-passe'
      : safeDestination(request.nextUrl.searchParams.get('next'));
  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(destination, request.url));
    } catch {
      /* Show the recoverable authentication error below. */
    }
  }
  return NextResponse.redirect(new URL('/connexion?erreur=lien', request.url));
}
