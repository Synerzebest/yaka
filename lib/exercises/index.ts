import { samePolynomial } from './answers.ts';
import { createTools, type ExerciseDraft, type Variant } from './build.ts';
import type { Exercise, ExerciseKind } from './types.ts';
import { yearOne } from './year-1.ts';
import { yearTwo } from './year-2.ts';
import { yearThree } from './year-3.ts';
import { yearFour } from './year-4.ts';
import { yearFive } from './year-5.ts';
import { yearSix } from './year-6.ts';

// The type annotation guarantees that every lesson has its templates.
const catalog: Record<ExerciseKind, Variant[]> = {
  ...yearOne,
  ...yearTwo,
  ...yearThree,
  ...yearFour,
  ...yearFive,
  ...yearSix,
};

export function exerciseVariants(kind: ExerciseKind) {
  return catalog[kind].map(variant => variant.id);
}

type Options = {
  /** Forces a template, for tests and previews. */
  variant?: string;
  /** Template of the previous exercise, avoided when another one exists. */
  avoid?: string;
};

// rng is injectable so every template can be checked reproducibly.
// The first value picks the template: with () => 0, each lesson gives its historical template.
export function generateExercise(kind: ExerciseKind, rng: () => number = Math.random, options: Options = {}): Exercise {
  const variants = catalog[kind];
  if (!variants) throw new Error(`Type d’exercice non pris en charge : ${kind}`);
  let chosen = options.variant ? variants.find(variant => variant.id === options.variant) : undefined;
  if (options.variant && !chosen) throw new Error(`Variante inconnue : ${kind}/${options.variant}`);
  if (!chosen) {
    const candidates = variants.length > 1 ? variants.filter(variant => variant.id !== options.avoid) : variants;
    chosen = candidates[Math.min(candidates.length - 1, Math.floor(rng() * candidates.length))];
  }
  return finalize(kind, chosen.id, chosen.build(createTools(rng)));
}

/**
 * A mistake equal to the correct answer would wrongly contradict the student: drop it.
 * When two classic mistakes give the same value, only the first explanation is kept.
 */
function finalize(kind: ExerciseKind, variant: string, draft: ExerciseDraft): Exercise {
  const exercise = { ...draft, kind, variant } as Exercise;
  if (exercise.format === 'polynomial') {
    exercise.mistakes = exercise.mistakes.filter(
      (item, index, all) =>
        !samePolynomial(item.value, exercise.answer) &&
        all.findIndex(other => samePolynomial(other.value, item.value)) === index,
    );
  } else {
    const same = (a: number, b: number) => Math.abs(a - b) < 1e-9;
    exercise.mistakes = exercise.mistakes.filter(
      (item, index, all) =>
        Number.isFinite(item.value) &&
        !same(item.value, exercise.answer) &&
        all.findIndex(other => same(other.value, item.value)) === index,
    );
  }
  return exercise;
}

/** Instances stored before answer formats existed are plain numeric exercises. */
export function normalizeStoredExercise(stored: unknown): Exercise {
  const exercise = stored as Partial<Exercise>;
  if (exercise.format) return exercise as Exercise;
  return { ...exercise, format: 'number', variant: exercise.variant ?? 'historique' } as Exercise;
}
