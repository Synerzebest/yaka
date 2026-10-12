import { parseAnswer } from './learning.ts';

export type GuidedAnswer = {
  answer: number;
  mistakes?: { value: number; message: string }[];
  retry: string;
};

export function assessGuidedAnswer(input: string, exercise: GuidedAnswer) {
  const value = parseAnswer(input);
  if (!Number.isFinite(value))
    return { status: 'invalid' as const, message: 'Écris un nombre ou une fraction, par exemple 3/4.' };
  if (Math.abs(value - exercise.answer) < 1e-9)
    return { status: 'correct' as const, message: 'Ton idée fonctionne. Regardons pourquoi.' };
  const mistake = exercise.mistakes?.find(item => Math.abs(item.value - value) < 1e-9);
  return { status: 'retry' as const, message: mistake?.message || exercise.retry };
}
