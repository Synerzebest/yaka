import test from 'node:test';
import assert from 'node:assert/strict';
import { topics } from '../lib/curriculum.ts';
import { discoveryLessons, discoveryForKind } from '../lib/discovery.ts';
import { assessGuidedAnswer } from '../lib/guided-answer.ts';
import { generateExercise, exerciseKinds, expectedInput } from '../lib/learning.ts';
import { exerciseGuidance } from '../lib/exercise-guidance.ts';
import { publicExercise } from '../lib/connected-learning.ts';

// Independent calculations for the two concrete questions in each authored lesson.
// A change to a story must also be checked against these mathematical reference cases.
const reference = {
  integers: [-4 + 7, -6 + 2],
  order_operations: [2 + 3 * 4, 5 + 2 * 6],
  equivalent_fractions: [2 * 2, 3 * 3],
  percentage: [80 * 0.25, 200 * 0.15],
  perimeter: [5 + 3 + 5 + 3, 7 + 2 + 7 + 2],
  triangle_angles: [180 - 50 - 60, 180 - 35 - 90],
  fractions: [2 / 8 + 3 / 8, 3 / 7 + 2 / 7],
  geometry: [4 * 3, 7 * 2],
  powers: [2 + 3, 2 + 4],
  proportion: [(6 / 3) * 5, (12 / 4) * 7],
  mean: [(2 + 5 + 8) / 3, (4 + 6 + 11) / 3],
  linear_equation: [(17 - 2) / 3, (13 + 3) / 4],
  distributivity: [3 * 2 + 1, 2 * 3 + 4],
  pythagoras: [Math.hypot(3, 4), Math.hypot(6, 8)],
  affine: [3 + 2 * 4, 3 * -1 - 2],
  slope: [(8 - 2) / (4 - 1), (1 - 5) / (2 - 0)],
  frequency: [(5 / 20) * 100, (8 / 40) * 100],
  quadratic_roots: [Math.max(2, 5), Math.max(-3, 4)],
  system: [(14 + 4) / 2, (20 + 6) / 2],
  sine_ratio: [3 / 5, 6 / 10],
  similarity: [(6 * 12) / 4, (7 * 15) / 5],
  vertex: [6 / 2, 8 / 2],
  probability: [3 / (3 + 2), 3 / 6],
  arithmetic_sequence: [10 + 4 * 3, 7 + 3 * 4],
  geometric_sequence: [3 * 2 ** 3, 5 * 3 ** 2],
  radians: [90 / 180, 120 / 180],
  unit_circle: [Math.sin((3 * Math.PI) / 2), Math.sin(Math.PI / 2)],
  dot_product: [3 * 2 + 4 * 0, 2 * 3 + -1 * 4],
  removable_limit: [2 + 2, 3 + 3],
  rational_limit: [3 / 2, 4 / 5],
  derivative: [2 * 3, 3 * 2 * 3],
  tangent: [2 ** 2 - 4 * 2, 3 ** 2 - 6 * 3],
  exponential: [100 * 1.1 ** 2, 5 * 2 ** 3],
  logarithm: [Math.log2(8), Math.log(81) / Math.log(3)],
  integral: [(3 * 6) / 2, 3 ** 2 - 1 ** 2],
  conditional_probability: [3 / 12, 4 / 10],
  combinations: [(4 * 3) / 2, (5 * 4) / 2],
  binomial: [3 / 2 ** 3, 4 / 2 ** 4],
  standardization: [(60 - 50) / 5, (42 - 50) / 4],
  optimization: [10 / 2, 8 / 2],
  area_between: [(2 * (6 - 2)) / 2, (3 * (12 - 6)) / 2],
};

for (const [kind, expected] of Object.entries(reference)) {
  test(`${kind}: discovery and transfer agree with the stated situation`, () => {
    const lesson = discoveryForKind(kind);
    assert.ok(lesson, kind);
    assert.ok(Math.abs(lesson.answer - expected[0]) < 1e-9, `${kind}: story`);
    assert.ok(Math.abs(lesson.transfer.answer - expected[1]) < 1e-9, `${kind}: transfer`);
    for (const mistake of lesson.mistakes) {
      assert.notEqual(mistake.value, lesson.answer, `${kind}: a correct answer must not be an error`);
      const feedback = assessGuidedAnswer(String(mistake.value), { ...lesson, retry: lesson.coach });
      assert.equal(feedback.status, 'retry');
      assert.equal(feedback.message, mistake.message);
    }
  });
}

test('every non-pilot lesson has a unique complete guided discovery, across all six years', () => {
  const others = topics.filter(topic => topic.slug !== 'equation-additive');
  assert.deepEqual(Object.keys(discoveryLessons).sort(), others.map(t => t.slug).sort());
  assert.equal(new Set(Object.values(discoveryLessons).map(d => d.kind)).size, 41);
  for (const topic of others) {
    const lesson = discoveryLessons[topic.slug];
    assert.equal(lesson.kind, topic.kind);
    for (const key of ['title', 'story', 'question', 'reasoning', 'symbols', 'rule', 'pitfall', 'coach'])
      assert.ok(lesson[key]?.trim(), `${topic.slug}: ${key}`);
    assert.ok(lesson.hints.length >= 2);
    assert.ok(lesson.hints.every(hint => typeof hint === 'string' && hint.trim()));
    assert.ok(lesson.mistakes.length >= 1);
    for (const key of ['question', 'hint', 'reasoning']) assert.ok(lesson.transfer[key]?.trim());
    assert.ok(Number.isFinite(lesson.answer) && Number.isFinite(lesson.transfer.answer));
  }
  assert.deepEqual([...new Set(others.map(t => t.year))].sort(), [1, 2, 3, 4, 5, 6]);
});

test('guided answers accept equivalent fractions and decimals and reject incomplete inputs', () => {
  const exercise = { answer: 5 / 8, retry: 'Garde des parts de même taille.' };
  for (const input of ['5/8', '10/16', '0,625', '0.625'])
    assert.equal(assessGuidedAnswer(input, exercise).status, 'correct');
  for (const input of ['', '  ', '1/0', 'NaN', '5/', '5/8/2', '<script>', 'Infinity'])
    assert.equal(assessGuidedAnswer(input, exercise).status, 'invalid');
  assert.equal(assessGuidedAnswer('1/8', exercise).message, exercise.retry);
});

test('a transfer about the derivative cannot be passed by evaluating the original function', () => {
  const { transfer } = discoveryForKind('derivative');
  assert.equal(assessGuidedAnswer('27', { ...transfer, retry: transfer.hint }).status, 'retry');
  assert.equal(assessGuidedAnswer('18', { ...transfer, retry: transfer.hint }).status, 'correct');
});

test('exercise guidance is available for each other lesson after an incorrect answer', () => {
  for (const kind of exerciseKinds) {
    const exercise = generateExercise(kind, () => 0.35);
    assert.equal(exerciseGuidance(exercise, expectedInput(exercise)), null);
    if (kind === 'equations') continue;
    const guidance = exerciseGuidance(exercise, exercise.format === 'number' ? String(exercise.answer + 987) : '987');
    assert.equal(guidance.question, discoveryForKind(kind).coach);
    assert.equal(guidance.observation, null);
    const payload = publicExercise(exercise);
    assert.ok(!('guidance' in payload));
    assert.ok(!('answer' in payload));
  }
});

test('known generated mistakes get a targeted observation without the worked solution', () => {
  const exercise = generateExercise('fractions', () => 0);
  const mistake = exercise.mistakes[0];
  const guidance = exerciseGuidance(exercise, String(mistake.value));
  assert.equal(guidance.observation, mistake.message);
  assert.ok(!('steps' in guidance));
  assert.ok(!('answer' in guidance));
});
