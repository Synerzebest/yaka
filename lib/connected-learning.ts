import type { Exercise } from './learning.ts';

export type PublicExercise = {
  kind: Exercise['kind'];
  variant: string;
  format: Exercise['format'];
  prompt: string;
  expression: string;
  hint: string;
  unit?: string;
  precision?: number;
  /** Only for multiple-choice questions. The correct index is never sent. */
  choices?: string[];
};
export type ExerciseSession = { id: string; expiresAt: string; exercise: PublicExercise };
export type LearningProgress = {
  correct: number;
  attempts: number;
  topicCorrect: Record<string, number>;
  days: string[];
  lastMistake?: string | null;
};
export const emptyProgress: LearningProgress = { correct: 0, attempts: 0, topicCorrect: {}, days: [] };

export function publicExercise(exercise: Exercise): PublicExercise {
  // Allowlist, so future answer/feedback fields are never accidentally sent.
  const payload: PublicExercise = {
    kind: exercise.kind,
    variant: exercise.variant,
    format: exercise.format,
    prompt: exercise.prompt,
    expression: exercise.expression,
    hint: exercise.hint,
    unit: exercise.unit,
  };
  if (exercise.format === 'number') payload.precision = exercise.precision;
  if (exercise.format === 'choice') payload.choices = [...exercise.choices];
  return payload;
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Shape check before the stored exercise is loaded. The format-specific check follows on the server. */
export function validSubmission(id: unknown, answer: unknown): answer is string {
  return (
    typeof id === 'string' &&
    uuid.test(id) &&
    typeof answer === 'string' &&
    answer.trim().length > 0 &&
    answer.length <= 100
  );
}

export function learningError(error: unknown) {
  const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : '';
  if (message.includes('exercise_expired')) return 'Cet exercice a expiré. Génère un nouvel exercice.';
  if (message.includes('exercise_rate_limit'))
    return 'Tu as demandé beaucoup d’exercices. Patiente une minute avant de réessayer.';
  if (message.includes('exercise_unavailable'))
    return 'Cet exercice est inaccessible. Reconnecte-toi ou génère un nouvel exercice.';
  if (message.includes('lesson_unavailable')) return 'Cette leçon n’est pas encore disponible sur le serveur.';
  if (message.includes('parental_consent_required'))
    return 'Ton compte attend l’autorisation de ton parent avant de pouvoir enregistrer des exercices.';
  if (message.includes('birth_date_required')) return 'Indique ta date de naissance dans ton espace pour continuer.';
  if (message.includes('learning_not_configured') || message.includes('schema cache'))
    return 'Les exercices connectés ne sont pas encore activés. La configuration serveur doit être terminée.';
  return 'Connexion au serveur impossible. Réessaie : une même réponse ne sera jamais comptée deux fois.';
}
