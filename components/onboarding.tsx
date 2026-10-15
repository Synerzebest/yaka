'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { requestParentalConsent, saveBirthDate } from '@/app/bienvenue/actions';
import { formatDate } from '@/lib/age';
import type { Access } from '@/lib/parental-consent';
import { Icon } from './icons';
import { Mascot } from './mascot';
import { BirthDateField } from './birth-date-field';

type Message = { text: string; failed: boolean } | null;

export function Onboarding({ initialAccess, studentEmail }: { initialAccess: Access; studentEmail: string }) {
  const router = useRouter();
  const [access, setAccess] = useState(initialAccess);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  async function submit(
    event: FormEvent<HTMLFormElement>,
    action: (form: FormData) => ReturnType<typeof saveBirthDate>,
    success?: string,
  ) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setMessage(null);
    try {
      const result = await action(form);
      if ('error' in result) setMessage({ text: result.error, failed: true });
      else {
        setAccess(result.access);
        if (result.access.status === 'allowed') {
          router.replace('/dashboard');
          router.refresh();
          return;
        }
        if (success) setMessage({ text: success, failed: false });
      }
    } catch {
      setMessage({ text: 'Connexion impossible. Vérifie ton accès internet et réessaie.', failed: true });
    } finally {
      setBusy(false);
    }
  }

  const feedback = (
    <div aria-live="polite">
      {message && <p className={`auth-message ${message.failed ? 'error' : 'success'}`}>{message.text}</p>}
    </div>
  );

  if (access.status === 'birth_date_required') {
    return (
      <>
        <Mascot className="auth-mascot" size={78} mood="thinking" />
        <h1>Encore une toute petite étape.</h1>
        <p className="auth-intro">
          Indique ta date de naissance. Elle sert uniquement à savoir si ton parent doit autoriser ton compte.
        </p>
        <form className="settings-form" onSubmit={event => submit(event, saveBirthDate)}>
          <div className="field">
            <span id="welcome-birth-date">Ta date de naissance</span>
            <BirthDateField labelId="welcome-birth-date" disabled={busy} />
          </div>
          <p>Vérifie-la bien : elle ne pourra plus être modifiée depuis ton compte.</p>
          {feedback}
          <button className="primary-button" disabled={busy}>
            {busy ? 'Enregistrement…' : 'Continuer'}
            <Icon name="arrow" size={16} />
          </button>
        </form>
      </>
    );
  }

  const consent = access.consent;
  return (
    <>
      <Mascot className="auth-mascot" size={78} />
      <h1>Ton parent doit dire oui.</h1>
      <p className="auth-intro">
        Comme tu as moins de 13 ans, la loi belge demande l’accord de ton parent ou représentant légal avant
        d’enregistrer tes résultats. Il recevra un e-mail avec un lien pour lire les informations et donner sa réponse.
      </p>
      {consent && (
        <div className="consent-status" role="status">
          <p>
            <strong>Demande envoyée à {consent.parentEmail}</strong> le {formatDate(consent.lastSentAt)}.
          </p>
          <p>
            Le lien reste valable jusqu’au {formatDate(consent.expiresAt)}. Demande à ton parent de vérifier ses
            courriers indésirables.
          </p>
        </div>
      )}
      <form
        className="settings-form"
        onSubmit={event =>
          submit(event, requestParentalConsent, 'C’est envoyé ! Préviens ton parent qu’un e-mail de Yaka l’attend.')
        }
      >
        <label>
          L’adresse e-mail de ton parent ou représentant légal
          <input
            name="parent_email"
            type="email"
            autoComplete="off"
            required
            maxLength={254}
            defaultValue={consent?.parentEmail ?? ''}
            disabled={busy}
          />
        </label>
        <p>
          Elle doit être différente de la tienne ({studentEmail}). Elle sert uniquement à demander et conserver son
          autorisation. En attendant, tu peux découvrir Yaka depuis la <Link href="/">page d’accueil</Link>.
        </p>
        {feedback}
        <button className="primary-button" disabled={busy}>
          {busy ? 'Envoi…' : consent ? 'Renvoyer la demande' : 'Envoyer la demande'}
          <Icon name="arrow" size={16} />
        </button>
      </form>
      {consent && (
        <button className="text-button auth-switch" disabled={busy} onClick={() => router.refresh()}>
          Mon parent a répondu : vérifier
        </button>
      )}
    </>
  );
}
