import test from 'node:test';
import assert from 'node:assert/strict';
import { exerciseKinds, generateExercise } from '../lib/learning.ts';
import { publicExercise, validSubmission, learningError } from '../lib/connected-learning.ts';

test('server exercise payload never exposes answers or feedback before submission', () => {
  for (const kind of exerciseKinds) {
    const exercise = { ...generateExercise(kind, () => 0.35), futureSecret: 'DO_NOT_LEAK' };
    const payload = JSON.parse(JSON.stringify(publicExercise(exercise)));
    assert.equal(payload.kind, kind);
    for (const forbidden of ['answer', 'steps', 'mistakes', 'futureSecret']) assert.ok(!(forbidden in payload));
    assert.deepEqual(
      Object.keys(payload).filter(
        k => !['kind', 'variant', 'format', 'prompt', 'expression', 'hint', 'unit', 'precision', 'choices'].includes(k),
      ),
      [],
    );
  }
});
test('submissions accept only an instance id and a bounded non-empty answer', () => {
  const id = '10000000-0000-0000-0000-000000000001';
  for (const answer of ['2/3', '-2,5', '0', ' .5 ', '3x² − 2x + 1']) assert.ok(validSubmission(id, answer));
  for (const answer of ['', '   ', 'x'.repeat(101), NaN, {}, null, 2]) assert.ok(!validSubmission(id, answer));
  for (const instance of [null, {}, '', 'not-a-uuid']) assert.ok(!validSubmission(instance, '2'));
});
test('database and secret details are not shown in user-facing failures', () => {
  const raw = 'secret-password at https://private.example/database';
  assert.ok(!learningError(new Error(raw)).includes(raw));
  assert.match(learningError(new Error('exercise_expired')), /expiré/);
  assert.match(learningError(new Error('exercise_rate_limit')), /minute/);
  assert.match(learningError(new Error('learning_not_configured')), /activés/);
});
