// Public entry point of the exercise engine. Templates live in lib/exercises/, one file per school year.
export { exerciseKinds } from './exercises/types.ts';
export type {
  AnswerFormat,
  ChoiceExercise,
  Exercise,
  ExerciseKind,
  NumberExercise,
  PolynomialExercise,
} from './exercises/types.ts';
export { exerciseVariants, generateExercise, normalizeStoredExercise } from './exercises/index.ts';
export {
  answerLabel,
  expectedInput,
  explain,
  findMistake,
  inspectAnswer,
  isCorrect,
  parseAnswer,
  parsePolynomial,
} from './exercises/answers.ts';
export { formatPolynomial } from './exercises/format.ts';
