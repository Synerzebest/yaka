import { discoveryForKind } from './discovery.ts';
import { findMistake, isCorrect, type Exercise } from './learning.ts';

// Called only after grading the stored instance. Never sent with an unsolved exercise.
export function exerciseGuidance(exercise: Exercise, answer: string) {
  if (isCorrect(exercise, answer)) return null;
  const lesson = discoveryForKind(exercise.kind);
  if (!lesson) return null; // The original equation pilot has its own substitution feedback.
  return { observation: findMistake(exercise, answer), question: lesson.coach };
}
