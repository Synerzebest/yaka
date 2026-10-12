import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LegalLinks } from '@/components/legal-links';
import { Onboarding } from '@/components/onboarding';
import { SignOutButton } from '@/components/profile-form';
import type { Access } from '@/lib/parental-consent';
import { createClient } from '@/lib/supabase/server';
import { supabaseConfig } from '@/lib/supabase/config';

export const metadata: Metadata = { title: 'Bienvenue — Yaka', robots: { index: false, follow: false } };

export default async function WelcomePage() {
  if (!supabaseConfig()) redirect('/connexion');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/connexion');
  const { data, error } = await supabase.rpc('get_my_access');
  const access = data as Access | null;
  if (access?.status === 'allowed') redirect('/dashboard');

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link className="auth-logo" href="/">
          yaka.
        </Link>
        <div className="eyebrow">BIENVENUE</div>
        {error || !access ? (
          <p className="auth-message error">
            Ton accès ne peut pas être vérifié pour le moment. Recharge la page dans un instant.
          </p>
        ) : (
          <Onboarding initialAccess={access} studentEmail={user.email ?? ''} />
        )}
        <SignOutButton />
        <LegalLinks />
      </div>
    </div>
  );
}
