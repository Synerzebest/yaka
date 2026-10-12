import test from 'node:test';
import assert from 'node:assert/strict';
import { ageOn, consentAge, formatDate, todayInBrussels, validateBirthDate } from '../lib/age.ts';
import {
  consentError,
  createConsentToken,
  hashConsentToken,
  validConsentToken,
  validateParentEmail,
} from '../lib/parental-consent.ts';

test('age changes on the birthday itself, including leap days', () => {
  assert.equal(consentAge, 13);
  assert.equal(ageOn('2013-10-12', '2026-10-12'), 13);
  assert.equal(ageOn('2013-10-13', '2026-10-12'), 12);
  assert.equal(ageOn('2013-11-01', '2026-10-31'), 12);
  assert.equal(ageOn('2012-02-29', '2025-02-28'), 12);
  assert.equal(ageOn('2012-02-29', '2025-03-01'), 13);
});

test('today is computed in Brussels, not in the server time zone', () => {
  assert.equal(todayInBrussels(new Date('2026-10-12T22:30:00Z')), '2026-10-13');
  assert.equal(todayInBrussels(new Date('2026-01-01T12:00:00Z')), '2026-01-01');
});

test('birth dates are validated and decide whether a parent must authorise the account', () => {
  const today = '2026-10-12';
  assert.deepEqual(validateBirthDate('2013-10-12', today), { data: '2013-10-12', needsParentalConsent: false });
  assert.deepEqual(validateBirthDate('2013-10-13', today), { data: '2013-10-13', needsParentalConsent: true });
  assert.equal(validateBirthDate(' 2008-05-01 ', today).needsParentalConsent, false);
  for (const invalid of [
    '',
    '2014-02-30',
    '2014-13-01',
    '14/02/2014',
    '1899-12-31',
    '2024-01-01',
    '2030-01-01',
    null,
    20140101,
  ]) {
    assert.ok(validateBirthDate(invalid, today).error, String(invalid));
  }
  assert.equal(formatDate('2026-10-19T08:00:00+00:00'), '19/10/2026');
});

test('consent links are random, and only their hash is stored', () => {
  const first = createConsentToken(),
    second = createConsentToken();
  assert.notEqual(first.token, second.token);
  assert.ok(validConsentToken(first.token));
  assert.match(first.hash, /^[0-9a-f]{64}$/);
  assert.equal(hashConsentToken(first.token), first.hash);
  assert.ok(!first.hash.includes(first.token));
  for (const invalid of [undefined, '', 'abc', `${first.token}x`, `${first.token.slice(1)}/`, 42])
    assert.ok(!validConsentToken(invalid));
});

test('the parent address must be valid and differ from the student’s', () => {
  assert.deepEqual(validateParentEmail(' Parent@Example.BE '), { data: 'parent@example.be' });
  assert.ok(validateParentEmail('eleve@example.be', 'Eleve@example.be').error);
  for (const invalid of ['', 'parent', 'parent@', 'a b@example.be', `${'x'.repeat(250)}@a.be`, null])
    assert.ok(validateParentEmail(invalid).error, String(invalid));
});

test('consent errors are readable and never expose server details', () => {
  const raw = 'duplicate key at https://private.example/database';
  assert.ok(!consentError(new Error(raw)).includes(raw));
  assert.match(consentError(new Error('consent_rate_limit')), /Patiente/);
  assert.match(consentError(new Error('consent_expired')), /expiré/);
  assert.match(consentError(new Error('birth_date_already_set')), /déjà enregistrée/);
});
