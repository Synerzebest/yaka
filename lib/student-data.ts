import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';
import { supabaseConfig } from './supabase/config';
import { mergeCurriculum, topics } from './curriculum';
import type { Profile } from './profile';
import type { LearningProgress } from './connected-learning';
import type { Access } from './parental-consent';

export const getStudentData = cache(async () => {
  if (!supabaseConfig()) redirect('/connexion');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/connexion');
  const [profile, access, progress, lessons] = await Promise.all([
    supabase.from('profiles').select('id,display_name,school_year,exercise_goal').eq('id', user.id).single(),
    supabase.rpc('get_my_access'),
    supabase.rpc('get_my_learning_progress'),
    supabase.from('lessons').select('*').eq('published', true),
  ]);
  if (profile.error || !profile.data) throw new Error('Ton profil ne peut pas être chargé. Réessaie dans un instant.');
  // Fails closed: without migration 004, the age and parental consent cannot be checked.
  if (access.error || !access.data) throw new Error('Ton accès ne peut pas être vérifié. Réessaie dans un instant.');
  if ((access.data as Access).status !== 'allowed') redirect('/bienvenue');
  return {
    profile: profile.data as Profile,
    progress: progress.error ? null : (progress.data as LearningProgress),
    courses: lessons.data ? mergeCurriculum(lessons.data) : topics,
    contentError: !!lessons.error,
  };
});
