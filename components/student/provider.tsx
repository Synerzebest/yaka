'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { getLearningProgress } from '@/app/exercices/actions';
import { updateProfile } from '@/app/compte/actions';
import { emptyProgress, type LearningProgress } from '@/lib/connected-learning';
import { topicsForYear, recommendLesson, type Topic } from '@/lib/curriculum';
import type { Profile } from '@/lib/profile';

type StudentContextValue = {
  profile: Profile;
  progress: LearningProgress;
  courses: Topic[];
  yearCourses: Topic[];
  recommended: Topic;
  busy: boolean;
  message: string;
  changeYear: (year: number) => Promise<void>;
  refresh: () => Promise<void>;
  acceptProgress: (progress: LearningProgress | null) => void;
};
const StudentContext = createContext<StudentContextValue | null>(null);
export function StudentProvider({
  initialProfile,
  initialProgress,
  courses,
  contentError,
  children,
}: {
  initialProfile: Profile;
  initialProgress: LearningProgress | null;
  courses: Topic[];
  contentError: boolean;
  children: ReactNode;
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [progress, setProgress] = useState(initialProgress || emptyProgress);
  const [message, setMessage] = useState(
    !initialProgress
      ? 'La progression n’a pas pu être chargée.'
      : contentError
        ? 'Les cours locaux sont affichés : le serveur est temporairement indisponible.'
        : '',
  );
  const [busy, setBusy] = useState(false);
  const revision = useRef(0);
  const acceptProgress = useCallback((value: LearningProgress | null) => {
    ++revision.current;
    if (value) {
      setProgress(value);
      setMessage('');
    } else setMessage('Ta réponse est enregistrée. Actualise pour récupérer la progression.');
  }, []);
  const refresh = useCallback(async () => {
    const current = ++revision.current;
    try {
      const response = await getLearningProgress();
      if (current !== revision.current) return;
      if ('progress' in response) {
        setProgress(response.progress);
        setMessage('');
      } else setMessage(response.error);
    } catch {
      if (current === revision.current) setMessage('Impossible de récupérer tes progrès. Réessaie.');
    }
  }, []);
  useEffect(() => {
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);
  async function changeYear(year: number) {
    setBusy(true);
    setMessage('');
    const form = new FormData();
    form.set('display_name', profile.display_name);
    form.set('school_year', String(year));
    form.set('exercise_goal', String(profile.exercise_goal));
    try {
      const result = await updateProfile(form);
      if (result.profile) setProfile(result.profile);
      else setMessage(result.error || 'Année non enregistrée.');
    } catch {
      setMessage('Année non enregistrée. Réessaie.');
    } finally {
      setBusy(false);
    }
  }
  const yearCourses = topicsForYear(courses, profile.school_year);
  const recommended = recommendLesson(yearCourses, progress.topicCorrect, progress.lastMistake ?? undefined);
  return (
    <StudentContext.Provider
      value={{
        profile,
        progress,
        courses,
        yearCourses,
        recommended,
        busy,
        message,
        changeYear,
        refresh,
        acceptProgress,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}
export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) throw new Error('StudentProvider missing');
  return context;
}
