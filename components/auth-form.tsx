'use client';

import { LegalLinks } from '@/components/legal-links';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { safeDestination } from '@/lib/navigation';
import { todayInBrussels, validateBirthDate } from '@/lib/age';
import { Icon } from './icons';
import { Mascot } from './mascot';

type Mode = 'login' | 'signup' | 'reset' | 'password';
function errorMessage(code?: string) {
  switch (code) {
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
    default:
      return 'La demande n’a pas abouti. Vérifie tes informations puis réessaie.';
  }
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
          setMessage(errorMessage(error.code));
        } else
          setMessage(
            'Si un compte correspond à cette adresse, tu recevras un lien pour choisir un nouveau mot de passe.',
          );
      } else if (mode === 'password') {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          setFailed(true);
          setMessage(errorMessage(error.code));
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
          setMessage(errorMessage(error.code));
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
          setMessage(errorMessage(error.code));
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
  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link className="auth-logo" href="/">
          yaka.
        </Link>
        <Mascot
          className="auth-mascot"
          size={78}
          mood={mode === 'reset' || mode === 'password' ? 'thinking' : 'idle'}
        />
        <div className="eyebrow">Les maths, à ta façon</div>
        <h1>
          {mode === 'signup'
            ? 'Bienvenue dans l’aventure !'
            : mode === 'reset'
              ? 'Mot de passe oublié ? Ça arrive.'
              : mode === 'password'
                ? 'Un nouveau mot de passe.'
                : 'Content de te revoir !'}
        </h1>
        <p className="auth-intro">
          {mode === 'signup'
            ? 'Ton compte garde tes progrès, sur tous tes appareils.'
            : mode === 'reset'
              ? 'Donne ton adresse e-mail : on t’envoie un lien pour en choisir un nouveau.'
              : mode === 'password'
                ? 'Au moins 8 caractères. Facile à retenir pour toi, difficile à deviner pour les autres.'
                : 'Connecte-toi pour reprendre là où tu t’étais arrêté·e.'}
        </p>
        {!configured && (
          <p className="auth-message error">
            Supabase n’est pas encore configuré. Le mode découverte reste disponible.
          </p>
        )}
        {(mode === 'login' || mode === 'signup') && (
          <div className="lesson-tabs">
            <button disabled={busy} className={mode === 'login' ? 'selected' : ''} onClick={() => changeMode('login')}>
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
            <label>
              Ta date de naissance
              <input
                name="birth_date"
                type="date"
                autoComplete="bday"
                required
                min="1900-01-01"
                max={todayInBrussels()}
                disabled={busy}
              />
            </label>
          )}
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
                required
                disabled={busy}
              />
            </label>
          )}
          {mode === 'signup' && (
            <div className="signup-legal-note">
              <p>
                Ton e-mail sert à gérer ton compte ; ton prénom ou pseudonyme et tes résultats servent à retrouver ton
                parcours. Consulte les <Link href="/conditions-utilisation">conditions d’utilisation</Link> et la{' '}
                <Link href="/confidentialite">politique de confidentialité</Link> avant de créer ton compte.
              </p>
              <p>
                Si tu es mineur, lis ces informations avec ton parent ou représentant légal. Si tu as moins de 13 ans,
                ton compte devra être autorisé par ton parent : après l’inscription, tu pourras lui envoyer une demande
                par e-mail.
              </p>
            </div>
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
        <Link className="auth-back" href="/">
          ← Revenir à l’accueil
        </Link>
        <LegalLinks />
      </div>
    </div>
  );
}
