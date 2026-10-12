import { formatPolynomial } from './format.ts';
import type { Exercise } from './types.ts';

const tolerance = 1e-9;
const close = (a: number, b: number) => Math.abs(a - b) < tolerance;

/** A number, a decimal with a comma or a point, or a fraction such as 3/4. */
export function parseAnswer(input: string): number {
  const value = input.trim().replace(',', '.');
  if (!value) return NaN;
  const parts = value.split('/');
  if (parts.length > 2 || parts.some(part => !part.trim() || !/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(part.trim())))
    return NaN;
  if (parts.length === 2 && Number(parts[1]) === 0) return NaN;
  const result = parts.length === 2 ? Number(parts[0]) / Number(parts[1]) : Number(value);
  return Number.isFinite(result) ? result : NaN;
}

export type ParsedPolynomial = { coefficients: number[]; reduced: boolean };
const maxDegree = 6;

/**
 * Reads a polynomial in x such as "3x² − 2x + 1", "y = -x + 4" or "f'(x) = 6x^2".
 * Products and parentheses are refused: the student must give the developed, reduced form.
 */
export function parsePolynomial(input: string): ParsedPolynomial | null {
  if (typeof input !== 'string' || input.length > 100) return null;
  const text = input
    .toLowerCase()
    .replace(/[−–]/g, '-')
    .replace(/,/g, '.')
    .replace(/\s+/g, '')
    .replace(/[×·*]/g, '')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/⁴/g, '^4')
    .replace(/^(?:y|[a-z][′']*\(x\))=/, '');
  if (!text) return null;
  const pattern = /([+-])?(\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?)?(x(?:\^(\d))?)?/y;
  const coefficients: number[] = [];
  const seen = new Set<number>();
  let reduced = true;
  let position = 0;
  while (position < text.length) {
    pattern.lastIndex = position;
    const match = pattern.exec(text);
    if (!match || match[0] === '' || pattern.lastIndex === position) return null;
    const [, sign, coefficientText, letter, exponentText] = match;
    if (position > 0 && !sign) return null;
    if (!coefficientText && !letter) return null;
    const coefficient = coefficientText ? parseAnswer(coefficientText) : 1;
    if (!Number.isFinite(coefficient)) return null;
    const degree = letter ? (exponentText ? Number(exponentText) : 1) : 0;
    if (degree > maxDegree) return null;
    if (seen.has(degree)) reduced = false;
    seen.add(degree);
    while (coefficients.length <= degree) coefficients.push(0);
    coefficients[degree] += sign === '-' ? -coefficient : coefficient;
    position = pattern.lastIndex;
  }
  return { coefficients: trim(coefficients), reduced };
}

function trim(coefficients: number[]) {
  const copy = [...coefficients];
  while (copy.length && close(copy[copy.length - 1], 0)) copy.pop();
  return copy;
}

export function samePolynomial(a: number[], b: number[]) {
  const left = trim(a),
    right = trim(b);
  return left.length === right.length && left.every((value, index) => close(value, right[index]));
}

function choiceIndex(exercise: Exercise, input: string) {
  if (exercise.format !== 'choice' || !/^\d{1,2}$/.test(input.trim())) return NaN;
  const index = Number(input.trim());
  return index < exercise.choices.length ? index : NaN;
}

/**
 * Checks the shape of the input before it is graded. An invalid input is never counted as an attempt.
 */
export function inspectAnswer(exercise: Exercise, input: unknown): { valid: true } | { valid: false; message: string } {
  if (typeof input !== 'string' || !input.trim() || input.length > 100) {
    return { valid: false, message: 'Saisis une réponse (100 caractères maximum).' };
  }
  if (exercise.format === 'choice') {
    return Number.isNaN(choiceIndex(exercise, input))
      ? { valid: false, message: 'Choisis une des réponses proposées.' }
      : { valid: true };
  }
  if (exercise.format === 'polynomial') {
    const parsed = parsePolynomial(input);
    if (!parsed) return { valid: false, message: 'Écris une expression développée en x, par exemple 3x² − 2x + 1.' };
    if (!parsed.reduced)
      return {
        valid: false,
        message: 'Ton expression contient plusieurs termes de même degré : regroupe-les pour la réduire.',
      };
    return { valid: true };
  }
  return Number.isFinite(parseAnswer(input))
    ? { valid: true }
    : { valid: false, message: 'Saisis un nombre ou une fraction, par exemple 3/4.' };
}

export function isCorrect(exercise: Exercise, input: string) {
  if (inspectAnswer(exercise, input).valid !== true) return false;
  if (exercise.format === 'choice') return choiceIndex(exercise, input) === exercise.answer;
  if (exercise.format === 'polynomial') return samePolynomial(parsePolynomial(input)!.coefficients, exercise.answer);
  const value = parseAnswer(input);
  // An exact fraction or the explicitly requested rounding is accepted.
  if (close(value, exercise.answer)) return true;
  return exercise.precision !== undefined && close(value, Number(exercise.answer.toFixed(exercise.precision)));
}

/** The targeted message for a recognised classic mistake, if any. */
export function findMistake(exercise: Exercise, input: string): string | null {
  if (inspectAnswer(exercise, input).valid !== true || isCorrect(exercise, input)) return null;
  if (exercise.format === 'choice') {
    const index = choiceIndex(exercise, input);
    return exercise.mistakes.find(item => item.value === index)?.message ?? null;
  }
  if (exercise.format === 'polynomial') {
    const parsed = parsePolynomial(input)!.coefficients;
    return exercise.mistakes.find(item => samePolynomial(item.value, parsed))?.message ?? null;
  }
  const value = parseAnswer(input);
  return exercise.mistakes.find(item => Number.isFinite(item.value) && close(item.value, value))?.message ?? null;
}

export function explain(exercise: Exercise, input: string) {
  return [findMistake(exercise, input), ...exercise.steps].filter(Boolean).join('\n');
}

/** What a student would type to answer correctly. Used by tests and to display solutions. */
export function expectedInput(exercise: Exercise) {
  if (exercise.format === 'polynomial') return formatPolynomial(exercise.answer);
  return String(exercise.answer);
}

/** Readable version of a submitted answer, as stored in the attempt history. */
export function answerLabel(exercise: Exercise, input: string) {
  if (exercise.format === 'choice') {
    const index = choiceIndex(exercise, input);
    return Number.isNaN(index) ? input.trim() : exercise.choices[index].slice(0, 100);
  }
  return input.trim();
}
