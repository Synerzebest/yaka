import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/auth-form';
import { supabaseConfig } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import { safeDestination } from '@/lib/navigation';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string; mode?: string; next?: string }>;
}) {
  const params = await searchParams;
  const configured = !!supabaseConfig();
  if (configured && !params.erreur) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect(safeDestination(params.next));
  }
  return (
    <AuthForm
      next={params.next}
      configured={configured}
      signup={params.mode === 'inscription'}
      invalidLink={params.erreur === 'lien'}
    />
  );
}
