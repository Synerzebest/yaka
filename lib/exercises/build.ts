import type { ChoiceExercise, ExerciseKind, Mistake, NumberExercise, PolynomialExercise } from './types.ts';

export type Tools = {
  int(min: number, max: number): number;
  /** An integer in [min, max] other than 0. Requires min < 0 < max. */
  nonZero(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
};

export function createTools(random: () => number): Tools {
  const int = (min: number, max: number) => Math.floor(random() * (max - min + 1)) + min;
  return {
    int,
    nonZero(min, max) {
      const value = int(min, max - 1);
      return value >= 0 ? value + 1 : value;
    },
    pick: items => items[int(0, items.length - 1)],
    shuffle(items) {
      const copy = [...items];
      for (let index = copy.length - 1; index > 0; index--) {
        const other = int(0, index);
        [copy[index], copy[other]] = [copy[other], copy[index]];
      }
      return copy;
    },
  };
}

type Draft<T> = Omit<T, 'kind' | 'variant'>;
export type ExerciseDraft = Draft<NumberExercise> | Draft<ChoiceExercise> | Draft<PolynomialExercise>;
export type Variant = { id: string; build: (tools: Tools) => ExerciseDraft };
export type VariantMap<K extends ExerciseKind> = Record<K, Variant[]>;

export const ratio = { precision: 3, hint: 'Fraction exacte ou décimal arrondi au millième.' };

type NumberOptions = Partial<Pick<NumberExercise, 'mistakes' | 'hint' | 'unit' | 'precision'>>;
export function numeric(
  prompt: string,
  expression: string,
  answer: number,
  steps: string[],
  options: NumberOptions = {},
): Draft<NumberExercise> {
  return {
    format: 'number',
    prompt,
    expression,
    answer,
    steps,
    mistakes: [],
    hint: 'Saisis un nombre, sans unité.',
    ...options,
  };
}

type PolynomialOptions = Partial<Pick<PolynomialExercise, 'mistakes' | 'hint'>>;
export function polynomial(
  prompt: string,
  expression: string,
  answer: number[],
  steps: string[],
  options: PolynomialOptions = {},
): Draft<PolynomialExercise> {
  return {
    format: 'polynomial',
    prompt,
    expression,
    answer,
    steps,
    mistakes: [],
    hint: 'Écris une expression réduite en x, par exemple 3x² − 2x + 1 (x^2 est aussi accepté).',
    ...options,
  };
}

/** Shuffles the labels, then records the correct index and a message for each distractor. */
export function choice(
  tools: Tools,
  prompt: string,
  expression: string,
  correct: string,
  distractors: Mistake<string>[],
  steps: string[],
  options: { hint?: string } = {},
): Draft<ChoiceExercise> {
  const choices = tools.shuffle([correct, ...distractors.map(item => item.value)]);
  return {
    format: 'choice',
    prompt,
    expression,
    choices,
    answer: choices.indexOf(correct),
    mistakes: distractors.map(item => ({ value: choices.indexOf(item.value), message: item.message })),
    steps: [...steps, `Bonne réponse : ${correct}.`],
    hint: options.hint ?? 'Choisis une seule réponse.',
  };
}
