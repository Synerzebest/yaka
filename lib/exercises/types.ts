export const exerciseKinds = [
  'integers',
  'order_operations',
  'equivalent_fractions',
  'percentage',
  'perimeter',
  'triangle_angles',
  'fractions',
  'equations',
  'geometry',
  'powers',
  'proportion',
  'mean',
  'linear_equation',
  'distributivity',
  'pythagoras',
  'affine',
  'slope',
  'frequency',
  'quadratic_roots',
  'system',
  'sine_ratio',
  'similarity',
  'vertex',
  'probability',
  'arithmetic_sequence',
  'geometric_sequence',
  'radians',
  'unit_circle',
  'dot_product',
  'removable_limit',
  'rational_limit',
  'derivative',
  'tangent',
  'exponential',
  'logarithm',
  'integral',
  'conditional_probability',
  'combinations',
  'binomial',
  'standardization',
  'optimization',
  'area_between',
] as const;
export type ExerciseKind = (typeof exerciseKinds)[number];

export type Mistake<T> = { value: T; message: string };

type Common = {
  kind: ExerciseKind;
  /** Identifies the template inside a lesson. Public, so the next exercise can differ. */
  variant: string;
  prompt: string;
  expression: string;
  steps: string[];
  hint: string;
  unit?: string;
};

/** A number, a fraction or a decimal rounded to the requested precision. */
export type NumberExercise = Common & {
  format: 'number';
  answer: number;
  precision?: number;
  mistakes: Mistake<number>[];
};

/** A multiple-choice question. The answer and the mistakes are indexes into `choices`. */
export type ChoiceExercise = Common & {
  format: 'choice';
  choices: string[];
  answer: number;
  mistakes: Mistake<number>[];
};

/** A reduced polynomial in x. Coefficients are stored by increasing degree: [c, b, a] = ax² + bx + c. */
export type PolynomialExercise = Common & {
  format: 'polynomial';
  answer: number[];
  mistakes: Mistake<number[]>[];
};

export type Exercise = NumberExercise | ChoiceExercise | PolynomialExercise;
export type AnswerFormat = Exercise['format'];
