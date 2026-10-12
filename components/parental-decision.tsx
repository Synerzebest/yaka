'use client';

import { useState, type FormEvent } from 'react';
import { decideParentalConsent } from '@/app/autorisation-parentale/actions';
import { formatDate } from '@/lib/age';

type Props = {
  token: string;
  status: 'pending' | 'granted' | 'expired';
  name: string;
  grantedAt: string | null;
  expiresAt: string;
};

export function ParentalDecision({ token, status, name, grantedAt, expiresAt }: Props) {
  const [outcome, setOutcome] = useState<'granted' | 'deleted' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [refusing, setRefusing] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>, decision: 'grant' | 'refuse') {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      const result = await decideParentalConsent(token, decision, form);
      if ('error' in result) setError(result.error);
      else setOutcome(result.decision);
    } catch {
      setError('Connexion impossible. Vérifiez votre accès internet et réessayez.');
    } finally {
      setBusy(false);
    }
  }

  if (outcome === 'deleted') {
    return (
      <p className="auth-message success" role="status">
        Le compte de {name} et ses données ont été supprimés. Ce lien ne fonctionne plus.
      </p>
    );
  }
  if (outcome === 'granted') {
    return (
      <p className="auth-message success" role="status">
        Merci ! Le compte de {name} est activé. Votre enfant peut se reconnecter pour commencer.
      </p>
    );
  }

  const errorMessage = <div aria-live="polite">{error && <p className="auth-message error">{error}</p>}</div>;

  const refusal = (
    <form className="settings-form consent-refusal" onSubmit={event => submit(event, 'refuse')}>
      <label className="checkbox-label">
        <input type="checkbox" name="confirm_deletion" required disabled={busy} />
        <span>
          Je comprends que le compte de {name}, sa progression et ses résultats seront définitivement supprimés.
        </span>
      </label>
      {errorMessage}
      <button className="outline-button danger-button" disabled={busy}>
        {busy ? 'Suppression…' : 'Supprimer le compte'}
      </button>
      <button
        type="button"
        className="text-button"
        disabled={busy}
        onClick={() => {
          setRefusing(false);
          setError('');
        }}
      >
        Annuler
      </button>
    </form>
  );

  if (status === 'granted') {
    return (
      <section className="consent-decision">
        <p className="auth-message success">Vous avez autorisé ce compte le {formatDate(grantedAt!)}.</p>
        {refusing ? (
          refusal
        ) : (
          <button className="text-button" onClick={() => setRefusing(true)}>
            Retirer mon autorisation et supprimer le compte
          </button>
        )}
      </section>
    );
  }

  return (
    <section className="consent-decision">
      {status === 'expired' ? (
        <p className="auth-message error">
          Ce lien a expiré le {formatDate(expiresAt)}. Pour autoriser le compte, demandez à votre enfant de vous
          renvoyer une demande depuis son compte. Vous pouvez encore refuser ci-dessous.
        </p>
      ) : refusing ? null : (
        <form className="settings-form" onSubmit={event => submit(event, 'grant')}>
          <label className="checkbox-label">
            <input type="checkbox" name="guardian" required disabled={busy} />
            <span>
              Je suis le parent ou le représentant légal de {name} et j’autorise la création de son compte Yaka et le
              traitement des données décrites ci-dessus.
            </span>
          </label>
          {errorMessage}
          <button className="primary-button" disabled={busy}>
            {busy ? 'Enregistrement…' : 'J’autorise ce compte'}
          </button>
        </form>
      )}
      {refusing ? (
        refusal
      ) : (
        <button
          className="text-button"
          disabled={busy}
          onClick={() => {
            setRefusing(true);
            setError('');
          }}
        >
          Je refuse : supprimer ce compte
        </button>
      )}
    </section>
  );
}
