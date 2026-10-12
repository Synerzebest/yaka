// Run against a locally running app. Creates and cleans one temporary account, without email.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID, randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
const base = process.env.TEST_APP_URL || 'http://localhost:3000';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Use a local app server');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
let userId;
let cookies = [];
const client = createServerClient(url, key, {
  cookies: {
    getAll: () => cookies,
    setAll: values => {
      cookies = values;
    },
  },
});
try {
  const landing = await fetch(base);
  assert.equal(landing.status, 200);
  for (const path of [
    '/dashboard',
    '/cours',
    '/exercices',
    '/progression',
    '/badges',
    '/cours/equation-additive?onglet=exercices',
  ]) {
    const response = await fetch(base + path, { redirect: 'manual' });
    assert.equal(response.status, 307, path);
    const location = new URL(response.headers.get('location'), base);
    assert.equal(location.pathname, '/connexion');
    assert.equal(location.searchParams.get('next'), path);
  }
  console.log('Public landing and guest redirects: OK');
  const email = `yaka-routes-${randomUUID()}@example.com`,
    password = randomBytes(24).toString('base64url');
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: 'Route test', birth_date: '1990-01-01' },
  });
  if (created.error) throw new Error('Temporary user creation failed');
  userId = created.data.user.id;
  const login = await client.auth.signInWithPassword({ email, password });
  if (login.error) throw new Error('Test sign-in failed');
  const headers = { Cookie: cookies.map(c => `${c.name}=${c.value}`).join('; ') };
  for (const [path, expected] of [
    ['/dashboard', 'Salut Route test'],
    ['/cours', 'Mes cours'],
    ['/exercices', 'Exercices'],
    ['/progression', 'Ma progression'],
    ['/badges', 'Mes badges'],
    ['/cours/equation-additive', 'Qu’y avait-il dans la poche ?'],
    ['/cours/equation-additive?onglet=analogie', 'Une équation, c’est une question sur un nombre.'],
    ['/cours/equation-additive?onglet=exercices', 'Préparation de ton exercice'],
  ]) {
    const response = await fetch(base + path, { headers, redirect: 'manual' });
    assert.equal(response.status, 200, path);
    assert.ok((await response.text()).includes(expected), `Missing expected content at ${path}`);
  }
  const discoveries = JSON.parse(readFileSync(new URL('../content/discoveries.json', import.meta.url), 'utf8'));
  const routes = Object.entries(discoveries).flatMap(([slug, lesson]) => [
    { path: `/cours/${slug}`, expected: 'class="guided-discovery"', title: lesson.title },
    { path: `/cours/${slug}?onglet=analogie`, expected: 'POUR RETROUVER LE FIL', title: lesson.title },
  ]);
  for (let offset = 0; offset < routes.length; offset += 4) {
    await Promise.all(
      routes.slice(offset, offset + 4).map(async ({ path, expected, title }) => {
        const response = await fetch(base + path, { headers, redirect: 'manual' });
        assert.equal(response.status, 200, path);
        const html = await response.text();
        assert.ok(html.includes(expected), `Missing guided panel at ${path}`);
        assert.ok(html.includes(title), `Wrong lesson at ${path}`);
      }),
    );
  }
  console.log('41 discoveries and their takeaway panels: OK');
  const missing = await fetch(base + '/cours/unknown-lesson', { headers });
  const html = await missing.text();
  assert.ok(html.includes('Cette leçon est introuvable.'));
  console.log('Authenticated pages, lesson panels and unknown lesson: OK');
} finally {
  await client.auth.signOut();
  if (userId) {
    const result = await admin.auth.admin.deleteUser(userId);
    if (result.error) throw new Error('Temporary test account cleanup failed');
    console.log('Temporary test account removed');
  }
}
