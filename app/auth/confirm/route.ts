import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Supports token-hash email templates, including confirmation on another device.
export async function GET(request: NextRequest) {
  const token_hash = request.nextUrl.searchParams.get('token_hash');
  const type = request.nextUrl.searchParams.get('type');
  if (token_hash && (type === 'email' || type === 'signup' || type === 'recovery')) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.verifyOtp({ token_hash, type });
      if (!error)
        return NextResponse.redirect(new URL(type === 'recovery' ? '/mot-de-passe' : '/dashboard', request.url));
    } catch {
      /* Show a user-facing expired/invalid-link message. */
    }
  }
  return NextResponse.redirect(new URL('/connexion?erreur=lien', request.url));
}
