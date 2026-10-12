'use server';

import { randomInt } from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { topics } from '@/lib/curriculum';
import { exerciseGuidance } from '@/lib/exercise-guidance';
import {
  answerLabel,
  explain,
  generateExercise,
  inspectAnswer,
  isCorrect,
  normalizeStoredExercise,
} from '@/lib/learning';
import {
  learningError,
  publicExercise,
  validSubmission,
  type ExerciseSession,
  type LearningProgress,
} from '@/lib/connected-learning';

type Failure = { error: string };

async function authenticated() {
  const client = await createClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) return null;
  return { client, user };
}

export async function getLearningProgress(): Promise<{ progress: LearningProgress } | Failure> {
  try {
    const auth = await authenticated();
    if (!auth) return { error: 'Reconnecte-toi pour retrouver ta progression.' };
    const { data, error } = await auth.client.rpc('get_my_learning_progress');
    if (error) return { error: learningError(error) };
    return { progress: data as LearningProgress };
  } catch (error) {
    return { error: learningError(error) };
  }
}

/** `previousVariant` is public information: it only lets the next exercise use another template. */
export async function startExercise(
  slug: string,
  previousVariant?: string,
): Promise<{ session: ExerciseSession } | Failure> {
  const topic = typeof slug === 'string' ? topics.find(item => item.slug === slug) : undefined;
  if (!topic) return { error: 'Cette leçon est introuvable.' };
  try {
    const auth = await authenticated();
    if (!auth) return { error: 'Reconnecte-toi pour enregistrer tes exercices.' };
    const admin = createAdminClient();
    const avoid = typeof previousVariant === 'string' ? previousVariant.slice(0, 60) : undefined;
    const exercise = generateExercise(topic.kind, () => randomInt(0, 2 ** 32) / 2 ** 32, { avoid });
    const { data, error } = await admin.rpc('server_create_exercise', {
      p_user_id: auth.user.id,
      p_lesson_slug: topic.slug,
      p_exercise: exercise,
    });
    if (error) return { error: learningError(error) };
    return { session: { id: data.id, expiresAt: data.expiresAt, exercise: publicExercise(exercise) } };
  } catch (error) {
    return { error: learningError(error) };
  }
}

export async function submitExercise(
  instanceId: string,
  answer: string,
): Promise<
  | {
      result: { correct: boolean; feedback: string; answer: string; guidance: ReturnType<typeof exerciseGuidance> };
      progress: LearningProgress | null;
    }
  | Failure
> {
  if (!validSubmission(instanceId, answer)) return { error: 'Saisis une réponse valide (100 caractères maximum).' };
  try {
    const auth = await authenticated();
    if (!auth) return { error: 'Reconnecte-toi avant de valider ta réponse.' };
    const admin = createAdminClient();
    const { data: instance, error: readError } = await admin.rpc('server_get_exercise', {
      p_user_id: auth.user.id,
      p_instance_id: instanceId,
    });
    if (readError) return { error: learningError(readError) };
    // Only the immutable server-generated exercise is graded; never browser parameters.
    const exercise = normalizeStoredExercise(instance.exercise);
    const shape = inspectAnswer(exercise, answer);
    // A malformed answer is not an attempt: the student can correct it.
    if (!shape.valid) return { error: shape.message };
    const { data: result, error } = await admin.rpc('server_record_attempt', {
      p_user_id: auth.user.id,
      p_instance_id: instanceId,
      p_answer: answerLabel(exercise, answer),
      p_correct: isCorrect(exercise, answer),
      p_feedback: explain(exercise, answer),
    });
    if (error) return { error: learningError(error) };
    const { data: progress, error: progressError } = await auth.client.rpc('get_my_learning_progress');
    // A network replay returns the first recorded answer: only guide the answer that was actually graded.
    const graded = result.answer === answerLabel(exercise, answer);
    // The attempt has committed, even if this separate read fails.
    return {
      result: { ...result, guidance: graded ? exerciseGuidance(exercise, answer) : null },
      progress: progressError ? null : (progress as LearningProgress),
    };
  } catch (error) {
    return { error: learningError(error) };
  }
}
