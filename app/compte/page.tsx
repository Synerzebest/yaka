import { LegalLinks } from '@/components/legal-links';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { supabaseConfig } from '@/lib/supabase/config';
import { ProfileForm, SignOutButton } from '@/components/profile-form';

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email: emailChange } = await searchParams;
  if (!supabaseConfig()) redirect('/connexion');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/connexion');
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, display_name, school_year, exercise_goal')
    .eq('id', user.id)
    .single();
  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/dashboard" className="auth-logo">
          yaka.
        </Link>
        <div className="eyebrow">À TA FAÇON</div>
        <h1>Ton espace, ton rythme.</h1>
        <p className="auth-intro">{user.email}</p>
        {emailChange === 'modifie' && (
          <p className="auth-message success" role="status">
            Changement d’adresse confirmé&nbsp;! Si on te l’a aussi demandé depuis ton autre adresse, clique sur le lien
            reçu là-bas pour terminer.
          </p>
        )}
        {error || !profile ? (
          <p className="auth-message error">Impossible de charger ton profil. Recharge la page pour réessayer.</p>
        ) : (
          <ProfileForm profile={profile} />
        )}
        <p className="account-privacy">
          <Link href="/contact#donnees">Demander une copie de mes données ou la fermeture de mon compte</Link>
        </p>
        <SignOutButton />
        <Link href="/dashboard" className="auth-back">
          ← Retour à mon tableau de bord
        </Link>
        <LegalLinks />
      </div>
    </div>
  );
}
