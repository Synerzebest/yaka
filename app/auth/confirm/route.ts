import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

// Links of the token-hash e-mail templates (supabase/templates/): they work even when the e-mail
// is opened on another device than the one that made the request.
const destinations: Partial<Record<EmailOtpType, string>> = {
  signup: '/dashboard',
  email: '/dashboard',
  magiclink: '/dashboard',
  recovery: '/mot-de-passe',
  email_change: '/compte?email=modifie',
};

export async function GET(request: NextRequest) {
  const token_hash = request.nextUrl.searchParams.get('token_hash');
  const type = request.nextUrl.searchParams.get('type') as EmailOtpType | null;
  const destination = type ? destinations[type] : undefined;
  if (token_hash && type && destination) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.verifyOtp({ token_hash, type });
      if (!error) return NextResponse.redirect(new URL(destination, request.url));
    } catch {
      /* Show a user-facing expired/invalid-link message. */
    }
  }
  return NextResponse.redirect(new URL('/connexion?erreur=lien', request.url));
}
