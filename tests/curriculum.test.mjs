import test from 'node:test';
import assert from 'node:assert/strict';
import { exerciseKinds, generateExercise, isCorrect, parseAnswer, explain, expectedInput } from '../lib/learning.ts';
import {
  topics,
  topicsForYear,
  correctForLesson,
  yearProgress,
  recommendLesson,
  mergeCurriculum,
} from '../lib/curriculum.ts';

// Independently calculated answers for the smallest generated inputs of each lesson's first template.
const fixtures = {
  integers: -1,
  order_operations: 6,
  equivalent_fractions: 4,
  percentage: 4,
  perimeter: 8,
  triangle_angles: 160,
  fractions: 2,
  equations: 2,
  geometry: 4,
  powers: 4,
  proportion: 18,
  mean: 2,
  linear_equation: -6,
  distributivity: 6,
  pythagoras: 5,
  affine: -18,
  slope: -4,
  frequency: 10,
  quadratic_roots: -4,
  system: -5,
  sine_ratio: 3 / 5,
  similarity: 4,
  vertex: -4,
  probability: 1 / 2,
  arithmetic_sequence: 6,
  geometric_sequence: 8,
  radians: 1 / 6,
  unit_circle: 0,
  dot_product: 40,
  removable_limit: 4,
  rational_limit: 1,
  derivative: -12,
  tangent: -4,
  exponential: 8,
  logarithm: 2,
  integral: 8,
  conditional_probability: 1 / 2,
  combinations: 10,
  binomial: 1 / 2,
  standardization: -3,
  optimization: 2,
  area_between: 4,
};
for (const kind of exerciseKinds) {
  test(`${kind}: known answer and feedback`, () => {
    const exercise = generateExercise(kind, () => 0);
    assert.equal(exercise.answer, fixtures[kind]);
    assert.ok(isCorrect(exercise, String(fixtures[kind])));
    assert.ok(!isCorrect(exercise, String(fixtures[kind] + 0.02)));
    assert.ok(explain(exercise, '999').length > 30);
  });
}

test('all 42 lessons have complete pedagogy and a supported exercise', () => {
  assert.equal(topics.length, 42);
  assert.equal(new Set(topics.map(t => t.slug)).size, 42);
  assert.deepEqual([...new Set(topics.map(t => t.kind))].sort(), [...exerciseKinds].sort());
  for (let year = 1; year <= 6; year++) assert.equal(topicsForYear(topics, year).length, year >= 5 ? 9 : 6);
  for (const topic of topics) {
    for (const field of ['theory', 'analogy', 'example', 'pitfall', 'description', 'analogyTitle'])
      assert.ok(topic[field].trim().length > 0, `${topic.slug}: ${field}`);
    assert.equal(topic.method.length, 3);
    assert.equal(topicsForYear(topics, topic.year).filter(t => t.slug === topic.slug).length, 1);
  }
});

test('every generated exercise has a valid answer, feedback and explicit precision', () => {
  let seed = 2026;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  for (const kind of exerciseKinds) {
    for (let i = 0; i < 100; i++) {
      const e = generateExercise(kind, random);
      assert.ok(isCorrect(e, expectedInput(e)), kind);
      assert.ok(!isCorrect(e, ''));
      assert.ok(!isCorrect(e, '1/0'));
      assert.ok(e.steps.length >= 2);
      if (e.format !== 'number') continue;
      assert.ok(Number.isFinite(e.answer), kind);
      if (e.precision !== undefined) assert.ok(isCorrect(e, e.answer.toFixed(e.precision)), kind);
      if (['probability', 'conditional_probability'].includes(kind)) assert.ok(e.answer >= 0 && e.answer <= 1, kind);
      if (kind === 'triangle_angles') assert.ok(e.answer > 0 && e.answer < 180);
      if (['area_between', 'geometry', 'perimeter'].includes(kind)) assert.ok(e.answer > 0);
      if (['unit_circle'].includes(kind)) assert.ok(Math.abs(e.answer) <= 1);
      if (kind === 'combinations') assert.ok(Number.isInteger(e.answer));
    }
  }
});

test('numeric parsing accepts equivalent fractions and only the requested rounding', () => {
  assert.equal(parseAnswer(' 10/14 '), 5 / 7);
  assert.equal(parseAnswer('-2,5'), -2.5);
  for (const invalid of ['', ' ', '2/', '/3', '2/3/4', '1/0', '2x', 'Infinity'])
    assert.ok(Number.isNaN(parseAnswer(invalid)), invalid);
  const e = { ...generateExercise('fractions', () => 0), answer: 2 / 3, precision: 3 };
  assert.ok(isCorrect(e, '4/6'));
  assert.ok(isCorrect(e, '0,667'));
  assert.ok(!isCorrect(e, '0,666'));
  assert.ok(!isCorrect(e, '0,67'));
  const same = generateExercise('fractions', () => 0.35, { variant: 'meme-denominateur' });
  assert.match(explain(same, String(same.mistakes[0].value)), /additionné les dénominateurs/);
});

test('progress is isolated by lesson and year; old three-module saves survive', () => {
  const fraction = topics.find(t => t.slug === 'fractions-meme-denominateur');
  const old = { fractions: 4, equations: 2, geometry: 1 };
  assert.equal(correctForLesson(old, fraction), 4);
  assert.equal(correctForLesson({ ...old, [fraction.slug]: 5 }, fraction), 5);
  assert.equal(yearProgress(old, topics, 1), 0);
  assert.equal(yearProgress(old, topics, 2), 23);
  const firstYear = Object.fromEntries(topicsForYear(topics, 1).map(t => [t.slug, 5]));
  assert.equal(yearProgress(firstYear, topics, 1), 100);
  assert.equal(yearProgress(firstYear, topics, 2), 0);
  assert.equal(yearProgress({}, [], 1), 0);
  const second = topicsForYear(topics, 2);
  assert.equal(recommendLesson(second, {}, second[3].slug).slug, second[3].slug);
  assert.equal(recommendLesson(second, {}, topicsForYear(topics, 6)[0].slug).year, 2);
});

test('remote content merges by slug, tolerates the old schema and preserves other years', () => {
  const merged = mergeCurriculum([{ slug: 'equation-additive', theory: 'Une explication mise à jour.' }]);
  assert.equal(merged.length, 42);
  assert.equal(merged.find(t => t.slug === 'equation-additive').theory, 'Une explication mise à jour.');
  assert.equal(merged.find(t => t.slug === '6-integrales').theory, topics.find(t => t.slug === '6-integrales').theory);
  const invalid = mergeCurriculum([{ slug: 'equation-additive', metadata: { method: [null], minutes: -1 } }]);
  assert.equal(invalid.find(t => t.slug === 'equation-additive').method.length, 3);
  assert.ok(invalid.find(t => t.slug === 'equation-additive').minutes > 0);
});
