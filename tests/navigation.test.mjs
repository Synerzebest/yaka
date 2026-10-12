import test from 'node:test';
import assert from 'node:assert/strict';
import { safeDestination, lessonHref } from '../lib/navigation.ts';
test('login preserves an internal lesson and its selected panel', () => {
  assert.equal(
    safeDestination('/cours/equation-additive?onglet=exercices'),
    '/cours/equation-additive?onglet=exercices',
  );
  assert.equal(lessonHref('equation-additive', 'analogie'), '/cours/equation-additive?onglet=analogie');
});
test('login rejects external, malformed and unrelated destinations', () => {
  for (const value of [
    undefined,
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    '/cours/../../auth/callback',
    '/connexion',
    '/dashboard\n',
  ])
    assert.equal(safeDestination(value), '/dashboard');
});
