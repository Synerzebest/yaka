'use client';

import { LegalLinks } from '@/components/legal-links';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { safeDestination } from '@/lib/navigation';
import { validateBirthDate } from '@/lib/age';
import { BirthDateField } from './birth-date-field';
import { Icon } from './icons';
import { Mascot } from './mascot';

type Mode = 'login' | 'signup' | 'reset' | 'password';
type AuthFailure = { code?: string; status?: number; message?: string };

function errorMessage(error: AuthFailure) {
  // Keep the technical details in the browser console: without them, a Supabase failure is silent.
  console.error('[Yaka] Supabase Auth:', { code: error.code, status: error.status, message: error.message });
  switch (error.code) {
    case 'invalid_credentials':
      return 'L’adresse e-mail ou le mot de passe est incorrect.';
    case 'email_not_confirmed':
      return 'Confirme ton adresse e-mail avant de te connecter.';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'Trop de demandes pour le moment. Patiente avant de réessayer.';
    case 'weak_password':
      return 'Choisis un mot de passe plus long et plus difficile à deviner.';
    case 'same_password':
      return 'Choisis un mot de passe différent du précédent.';
    case 'email_address_invalid':
      return 'Cette adresse e-mail n’est pas acceptée. Vérifie-la ou utilise une autre adresse.';
    case 'user_already_exists':
    case 'email_exists':
      return 'Un compte existe déjà avec cette adresse. Connecte-toi, ou utilise « Mot de passe oublié ».';
    case 'signup_disabled':
      return 'Les inscriptions sont fermées pour le moment.';
  }
  // Supabase cannot send its e-mail (SMTP settings): the account is not created.
  if (/sending (confirmation|recovery|magic link|email change) email/i.test(error.message ?? '')) {
    return 'On n’arrive pas à t’envoyer l’e-mail pour le moment, donc rien n’a été créé. Réessaie dans quelques minutes.';
  }
  if (error.status && error.status >= 500) {
    return 'Le service de connexion a un souci de notre côté. Réessaie dans quelques minutes.';
  }
  return 'La demande n’a pas abouti. Vérifie tes informations puis réessaie.';
}
export function AuthForm({
  configured,
  invalidLink = false,
  passwordUpdate = false,
  signup = false,
  next = '/dashboard',
}: {
  configured: boolean;
  invalidLink?: boolean;
  passwordUpdate?: boolean;
  signup?: boolean;
  next?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(passwordUpdate ? 'password' : signup ? 'signup' : 'login');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(
    invalidLink ? 'Ce lien est invalide ou a expiré. Connecte-toi ou demande un nouveau lien.' : '',
  );
  const [failed, setFailed] = useState(invalidLink);
  function changeMode(next: Mode) {
    setMode(next);
    setMessage('');
    setFailed(false);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !configured) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');
    setBusy(true);
    setMessage('');
    setFailed(false);
    try {
      const supabase = createClient();
      if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/mot-de-passe`,
        });
        if (error) {
          setFailed(true);
          setMessage(errorMessage(error));
        } else
          setMessage(
            'Si un compte correspond à cette adresse, tu recevras un lien pour choisir un nouveau mot de passe.',
          );
      } else if (mode === 'password') {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          setFailed(true);
          setMessage(errorMessage(error));
        } else {
          router.replace('/compte');
          router.refresh();
          return;
        }
      } else if (mode === 'signup') {
        const name = String(form.get('name') || '').trim();
        if (!name) {
          setFailed(true);
          setMessage('Renseigne ton prénom.');
          return;
        }
        const birthDate = validateBirthDate(form.get('birth_date'));
        if ('error' in birthDate) {
          setFailed(true);
          setMessage(birthDate.error!);
          return;
        }
        // Copied into the profile by the database. Under 13, the account waits for a parent's authorisation.
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name, birth_date: birthDate.data },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeDestination(next))}`,
          },
        });
        if (error) {
          setFailed(true);
          setMessage(errorMessage(error));
        } else if (data.session) {
          router.replace(safeDestination(next));
          router.refresh();
          return;
        } else
          setMessage(
            'Consulte ta boîte mail pour confirmer ton inscription. Si tu as déjà un compte, utilise la connexion.',
          );
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setFailed(true);
          setMessage(errorMessage(error));
        } else {
          router.replace(safeDestination(next));
          router.refresh();
          return;
        }
      }
    } catch {
      setFailed(true);
      setMessage('Connexion impossible. Vérifie ton accès internet et réessaie.');
    } finally {
      setBusy(false);
    }
  }
  const title =
    mode === 'signup'
      ? 'Bienvenue dans l’aventure !'
      : mode === 'reset'
        ? 'Mot de passe oublié ? Ça arrive.'
        : mode === 'password'
          ? 'Un nouveau mot de passe.'
          : 'Content de te revoir !';
  const intro =
    mode === 'signup'
      ? 'Ton compte garde tes progrès, sur tous tes appareils.'
      : mode === 'reset'
        ? 'Donne ton adresse e-mail : on t’envoie un lien pour en choisir un nouveau.'
        : mode === 'password'
          ? 'Au moins 8 caractères. Facile à retenir pour toi, difficile à deviner pour les autres.'
          : 'Connecte-toi pour reprendre là où tu t’étais arrêté·e.';
  // Two columns on a computer, so the whole signup form fits on screen without scrolling.
  return (
    <div className="auth-page">
      <div className="auth-card auth-split">
        <aside className="auth-aside">
          <Link className="auth-logo" href="/">
            yaka.
          </Link>
          <div className="eyebrow">Les maths, à ta façon</div>
          <h1>{title}</h1>
          <p className="auth-intro">{intro}</p>
          {(mode === 'signup' || mode === 'login') && (
            <ul className="auth-perks">
              <li>Gratuit et sans pub</li>
              <li>Des explications avec des mots simples</li>
              <li>Tes progrès sur tous tes appareils</li>
            </ul>
          )}
          <Mascot
            className="auth-mascot"
            size={110}
            mood={mode === 'reset' || mode === 'password' ? 'thinking' : 'idle'}
          />
        </aside>
        <div className="auth-main">
          {!configured && (
            <p className="auth-message error">
              Supabase n’est pas encore configuré. Le mode découverte reste disponible.
            </p>
          )}
          {(mode === 'login' || mode === 'signup') && (
            <div className="lesson-tabs">
              <button
                disabled={busy}
                className={mode === 'login' ? 'selected' : ''}
                onClick={() => changeMode('login')}
              >
                Connexion
              </button>
              <button
                disabled={busy}
                className={mode === 'signup' ? 'selected' : ''}
                onClick={() => changeMode('signup')}
              >
                Créer un compte
              </button>
            </div>
          )}
          <form className="settings-form" onSubmit={submit}>
            {mode === 'signup' && (
              <label>
                Ton prénom ou pseudonyme
                <input name="name" autoComplete="given-name" required maxLength={80} disabled={busy} />
              </label>
            )}
            {mode === 'signup' && (
              <div className="field">
                <span id="signup-birth-date">Ta date de naissance</span>
                <BirthDateField labelId="signup-birth-date" disabled={busy} />
              </div>
            )}
            <div className={mode === 'signup' ? 'form-row' : 'form-stack'}>
              {mode !== 'password' && (
                <label>
                  Ton adresse e-mail
                  <input name="email" type="email" autoComplete="email" required maxLength={254} disabled={busy} />
                </label>
              )}
              {mode !== 'reset' && (
                <label>
                  Ton mot de passe
                  <input
                    name="password"
                    type="password"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    minLength={mode === 'login' ? undefined : 8}
                    placeholder={mode === 'login' ? undefined : '8 caractères minimum'}
                    required
                    disabled={busy}
                  />
                </label>
              )}
            </div>
            {mode === 'signup' && (
              <p className="signup-legal-note">
                En créant ton compte, tu acceptes les{' '}
                <Link href="/conditions-utilisation">conditions d’utilisation</Link>. Ton e-mail, ton pseudo et tes
                résultats servent seulement à faire fonctionner ton compte (
                <Link href="/confidentialite">confidentialité</Link>). Tu es mineur ? Lis-les avec ton parent.
              </p>
            )}
            <div aria-live="polite">
              {message && <p className={`auth-message ${failed ? 'error' : 'success'}`}>{message}</p>}
            </div>
            <button className="primary-button" disabled={busy || !configured}>
              {busy
                ? 'Un petit instant…'
                : mode === 'signup'
                  ? 'Créer mon compte'
                  : mode === 'reset'
                    ? 'Recevoir un lien'
                    : mode === 'password'
                      ? 'Enregistrer mon mot de passe'
                      : 'Me connecter'}
              <Icon name="arrow" size={16} />
            </button>
          </form>
          {mode === 'login' && (
            <button className="text-button auth-switch" disabled={busy} onClick={() => changeMode('reset')}>
              Mot de passe oublié ?
            </button>
          )}
          {mode === 'reset' && (
            <button className="text-button auth-switch" disabled={busy} onClick={() => changeMode('login')}>
              Retour à la connexion
            </button>
          )}
        </div>
      </div>
      <div className="auth-below">
        <Link className="auth-back" href="/">
          ← Revenir à l’accueil
        </Link>
        <LegalLinks />
      </div>
    </div>
  );
}
