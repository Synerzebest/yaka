import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/auth-form';
import { createClient } from '@/lib/supabase/server';
import { supabaseConfig } from '@/lib/supabase/config';

export default async function PasswordPage() {
  if (!supabaseConfig()) redirect('/connexion');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/connexion?erreur=lien');
  return <AuthForm configured passwordUpdate />;
}
