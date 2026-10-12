// Explicit integration test: creates TWO temporary confirmed accounts, sends no email,
// tests the public and server APIs, then deletes only the accounts it created.
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { generateExercise, isCorrect, explain } from '../lib/learning.ts';
import { publicExercise } from '../lib/connected-learning.ts';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || !secret)
  throw new Error('Configure the three Supabase environment variables before running this test.');
const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
const admin = createClient(url, secret, options);
const created = [];
const clients = [];
const credentials = [];
const checked = (response, label) => {
  if (response.error)
    throw new Error(`${label} failed (${response.error.code || response.error.status || 'API error'}).`);
  return response.data;
};
let cleanupFailed = false;
try {
  const preflight = await admin.rpc('server_get_exercise', { p_user_id: randomUUID(), p_instance_id: randomUUID() });
  if (!preflight.error?.message.includes('exercise_unavailable'))
    throw new Error('Apply migration 003 and verify the server key before running the integration test.');
  const consentPreflight = await admin.rpc('server_get_parental_consent', { p_token_hash: '0'.repeat(64) });
  if (!consentPreflight.error?.message.includes('consent_unavailable'))
    throw new Error('Apply migration 004 before running the integration test.');
  for (let index = 0; index < 2; index++) {
    const email = `yaka-integration-${randomUUID()}@example.com`;
    const password = randomBytes(24).toString('base64url');
    const result = checked(
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: `Test ${index}`, birth_date: '1990-01-01' },
      }),
      'Create temporary user',
    );
    assert.ok(result.user);
    created.push(result.user.id);
    credentials.push({ email, password });
    const client = createClient(url, key, options);
    checked(await client.auth.signInWithPassword({ email, password }), 'Password sign-in');
    clients.push(client);
    const profiles = checked(await client.from('profiles').select('id,display_name'), 'Read own profile');
    assert.equal(profiles.length, 1);
    assert.equal(profiles[0].id, result.user.id);
    checked(
      await client
        .from('profiles')
        .update({ display_name: `Updated ${index}`, school_year: 3, exercise_goal: 10 })
        .eq('id', result.user.id),
      'Update own profile',
    );
  }
  const [alice, bob] = clients;
  const forbidden = await bob.from('profiles').update({ display_name: 'Forbidden' }).eq('id', created[0]).select('id');
  assert.ok(forbidden.error || forbidden.data.length === 0);
  const exercise = generateExercise('equations', () => 0.35);
  const session = checked(
    await admin.rpc('server_create_exercise', {
      p_user_id: created[0],
      p_lesson_slug: 'equation-additive',
      p_exercise: exercise,
    }),
    'Create server exercise',
  );
  const payload = publicExercise(exercise);
  assert.ok(!('answer' in payload));
  const instanceArgs = { p_user_id: created[0], p_instance_id: session.id };
  assert.ok((await alice.rpc('server_get_exercise', instanceArgs)).error, 'Browser could access answers');
  assert.ok(
    (await admin.rpc('server_get_exercise', { ...instanceArgs, p_user_id: created[1] })).error,
    'Wrong owner accepted',
  );
  const stored = checked(await admin.rpc('server_get_exercise', instanceArgs), 'Read owned instance');
  const answer = String(exercise.answer);
  const args = {
    ...instanceArgs,
    p_answer: answer,
    p_correct: isCorrect(stored.exercise, answer),
    p_feedback: explain(stored.exercise, answer),
  };
  assert.ok((await alice.rpc('server_record_attempt', args)).error, 'Browser could forge results');
  const duplicate = await Promise.all([
    admin.rpc('server_record_attempt', args),
    admin.rpc('server_record_attempt', args),
  ]);
  const first = checked(duplicate[0], 'Record attempt'),
    second = checked(duplicate[1], 'Replay attempt');
  assert.equal(first.id, second.id);
  assert.equal(first.correct, true);
  const replay = checked(
    await admin.rpc('server_record_attempt', { ...args, p_answer: '999', p_correct: false, p_feedback: 'Wrong' }),
    'Modified replay',
  );
  assert.equal(replay.answer, answer);
  assert.equal(replay.correct, true);
  const progress = checked(await alice.rpc('get_my_learning_progress'), 'Read progress');
  assert.equal(progress.correct, 1);
  assert.equal(progress.attempts, 1);
  assert.equal(progress.topicCorrect['equation-additive'], 1);
  assert.equal(progress.days.length, 1);
  const freshSession = createClient(url, key, options);
  clients.push(freshSession);
  checked(await freshSession.auth.signInWithPassword(credentials[0]), 'Sign in on a new session');
  const restored = checked(await freshSession.rpc('get_my_learning_progress'), 'Restore progress after sign-in');
  assert.deepEqual(restored, progress);
  const restoredProfile = checked(
    await freshSession.from('profiles').select('display_name,school_year,exercise_goal').single(),
    'Restore profile',
  );
  assert.deepEqual(restoredProfile, { display_name: 'Updated 0', school_year: 3, exercise_goal: 10 });
  const otherProgress = checked(await bob.rpc('get_my_learning_progress'), 'Other account progress');
  assert.equal(otherProgress.correct, 0);
  assert.equal(checked(await bob.from('exercise_attempts').select('id'), 'Other account attempts').length, 0);
  console.log(
    'Supabase OK: sign-in, profile persistence/RLS, server exercises, concurrent replay, correction, per-account progress and restoration in a new session.',
  );
} finally {
  await Promise.allSettled(clients.map(client => client.auth.signOut({ scope: 'local' })));
  for (const id of created) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) {
      cleanupFailed = true;
      console.error(`Temporary test account cleanup failed for ${id}.`);
    }
  }
  if (created.length && !cleanupFailed)
    console.log('Both temporary test accounts and their dependent data were removed. No email was sent.');
  if (cleanupFailed) process.exitCode = 1;
}
