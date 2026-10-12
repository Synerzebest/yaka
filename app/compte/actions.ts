'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { validateProfile } from '@/lib/profile';

export async function updateProfile(formData: FormData) {
  const validated = validateProfile({
    display_name: formData.get('display_name'),
    school_year: formData.get('school_year'),
    exercise_goal: formData.get('exercise_goal'),
  });
  if (validated.error) return { error: validated.error };
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { error: 'Reconnecte-toi pour modifier ton profil.' };
    const { data, error } = await supabase
      .from('profiles')
      .update(validated.data)
      .eq('id', user.id)
      .select('id, display_name, school_year, exercise_goal')
      .single();
    if (error || !data) return { error: 'Ton profil n’a pas pu être enregistré. Réessaie dans un instant.' };
    revalidatePath('/', 'layout');
    revalidatePath('/compte');
    return { profile: data };
  } catch {
    return { error: 'La connexion est indisponible. Ton profil n’a pas été modifié.' };
  }
}
