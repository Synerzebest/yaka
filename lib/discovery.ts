import discoveries from '../content/discoveries.json' with { type: 'json' };
import type { ExerciseKind } from './learning';

export type Discovery = {
  kind: ExerciseKind;
  title: string;
  story: string;
  question: string;
  answer: number;
  hints: string[];
  reasoning: string;
  symbols: string;
  rule: string;
  pitfall: string;
  transfer: { question: string; answer: number; hint: string; reasoning: string };
  mistakes: { value: number; message: string }[];
  coach: string;
};

// These public, guided examples are deliberately separate from graded server exercises.
// Each route sends only its own discovery to the interactive component.
export const discoveryLessons: Record<string, Discovery> = discoveries as Record<string, Discovery>;
export function discoveryForKind(kind: ExerciseKind) {
  return Object.values(discoveryLessons).find(lesson => lesson.kind === kind);
}
