'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile } from '@/app/compte/actions';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/profile';
import { Icon } from './icons';
import { Select, schoolYearOptions } from './select';

export function ProfileForm({ profile, onSaved }: { profile: Profile; onSaved?: (profile: Profile) => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setMessage('');
    setFailed(false);
    try {
      const result = await updateProfile(form);
      if (result.error || !result.profile) {
        setFailed(true);
        setMessage(result.error || 'Enregistrement impossible.');
      } else {
        setMessage('Ton profil a été enregistré.');
        onSaved?.(result.profile);
        router.refresh();
      }
    } catch {
      setFailed(true);
      setMessage('Enregistrement impossible. Réessaie dans un instant.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="settings-form" onSubmit={submit}>
      <label>
        Ton prénom ou pseudonyme
        <input name="display_name" defaultValue={profile.display_name} maxLength={80} required disabled={busy} />
      </label>
      <div className="field">
        <span id="profile-year">Ton année</span>
        <Select
          labelledBy="profile-year"
          name="school_year"
          options={schoolYearOptions}
          defaultValue={String(profile.school_year)}
          disabled={busy}
        />
      </div>
      <div className="field">
        <span id="profile-goal">Ton objectif</span>
        <Select
          labelledBy="profile-goal"
          name="exercise_goal"
          defaultValue={String(profile.exercise_goal)}
          disabled={busy}
          options={[
            { value: '3', label: '3 exercices', hint: 'Un petit pas 🌱' },
            { value: '5', label: '5 exercices', hint: 'Un bel élan 🚀' },
            { value: '10', label: '10 exercices', hint: 'En pleine forme 🔥' },
          ]}
        />
      </div>
      <p>
        Ton prénom, ton année et ton objectif sont sauvegardés dans ton compte. Tes exercices réalisés avec ce compte
        sont également sauvegardés.
      </p>
      <div aria-live="polite">
        {message && <p className={`auth-message ${failed ? 'error' : 'success'}`}>{message}</p>}
      </div>
      <button className="primary-button" disabled={busy}>
        {busy ? 'Enregistrement…' : 'Enregistrer mon profil'}
        <Icon name="check" size={17} />
      </button>
    </form>
  );
}
export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function signOut() {
    setBusy(true);
    setMessage('');
    try {
      const { error } = await createClient().auth.signOut({ scope: 'local' });
      if (error) {
        setMessage('Déconnexion impossible. Réessaie.');
        setBusy(false);
      } else {
        router.replace('/');
        router.refresh();
      }
    } catch {
      setMessage('Connexion indisponible. Réessaie.');
      setBusy(false);
    }
  }
  return (
    <div className="sign-out">
      <button className="text-button" onClick={signOut} disabled={busy}>
        {busy ? 'Déconnexion…' : 'Me déconnecter'}
      </button>
      <p role="status">{message}</p>
    </div>
  );
}
