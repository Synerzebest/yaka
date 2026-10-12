import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProfile } from '../lib/profile.ts';
import { createProgressStore } from '../lib/progress-store.ts';

test('profile validation trims names and rejects invalid school years and goals', () => {
  assert.deepEqual(validateProfile({ display_name: '  Alex  ', school_year: '2', exercise_goal: '5' }).data, {
    display_name: 'Alex',
    school_year: 2,
    exercise_goal: 5,
  });
  for (const school_year of ['0', '7', '2.5', 'abc', null]) {
    assert.ok(validateProfile({ display_name: 'Alex', school_year, exercise_goal: 5 }).error);
  }
  for (const exercise_goal of [0, 4, 100, null]) {
    assert.ok(validateProfile({ display_name: 'Alex', school_year: 2, exercise_goal }).error);
  }
  for (const display_name of ['', '   ', 'x'.repeat(81), null]) {
    assert.ok(validateProfile({ display_name, school_year: 2, exercise_goal: 5 }).error);
  }
});

test('local attempts are isolated between guests and different accounts, with an offline fallback', () => {
  const values = new Map();
  globalThis.window = new EventTarget();
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  const guest = createProgressStore(),
    alex = createProgressStore('alex'),
    sam = createProgressStore('sam');
  let changes = 0;
  const unsubscribe = alex.subscribe(() => changes++);
  assert.equal(guest.save({ correct: 8 }), true);
  assert.equal(alex.getSnapshot(), null);
  alex.save({ correct: 2 });
  assert.equal(JSON.parse(alex.getSnapshot()).correct, 2);
  assert.equal(sam.getSnapshot(), null);
  assert.equal(JSON.parse(guest.getSnapshot()).correct, 8);
  assert.equal(alex.getServerSnapshot(), null);
  assert.equal(changes, 1);
  unsubscribe();
  alex.save({ correct: 3 });
  assert.equal(changes, 1);
  assert.equal(JSON.parse(createProgressStore('alex').getSnapshot()).correct, 3);
  globalThis.localStorage.setItem = () => {
    throw new Error('storage unavailable');
  };
  assert.equal(alex.save({ correct: 4 }), false);
  assert.equal(JSON.parse(alex.getSnapshot()).correct, 4);
});
