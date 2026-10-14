import test from 'node:test';
import assert from 'node:assert/strict';
import { currentStreak } from '../lib/streak.ts';

test('the streak counts consecutive days ending today or yesterday', () => {
  assert.equal(currentStreak([], '2026-10-14'), 0);
  assert.equal(currentStreak(['2026-10-14'], '2026-10-14'), 1);
  assert.equal(currentStreak(['2026-10-12', '2026-10-13', '2026-10-14'], '2026-10-14'), 3);
  // Not practised yet today: yesterday's streak is still alive.
  assert.equal(currentStreak(['2026-10-12', '2026-10-13'], '2026-10-14'), 2);
  // A missed day breaks it.
  assert.equal(currentStreak(['2026-10-10', '2026-10-11'], '2026-10-14'), 0);
  assert.equal(currentStreak(['2026-10-10', '2026-10-12', '2026-10-13', '2026-10-14'], '2026-10-14'), 3);
  // Month, year and daylight-saving boundaries.
  assert.equal(currentStreak(['2026-09-30', '2026-10-01'], '2026-10-01'), 2);
  assert.equal(currentStreak(['2025-12-31', '2026-01-01'], '2026-01-01'), 2);
  assert.equal(currentStreak(['2026-10-24', '2026-10-25', '2026-10-26'], '2026-10-26'), 3);
});
