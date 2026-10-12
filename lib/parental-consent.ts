import { createHash, randomBytes } from 'node:crypto';

/** Version of the information shown to parents. Change it when the consent text changes. */
export const consentNoticeVersion = '2026-10-12';

export type AccessStatus = 'allowed' | 'birth_date_required' | 'parental_consent_required';
export type Access = {
  status: AccessStatus;
  birthDate: string | null;
  consent: {
    parentEmail: string;
    requestedAt: string;
    expiresAt: string;
    lastSentAt: string;
    grantedAt: string | null;
  } | null;
};

/** The link sent to the parent. Only its SHA-256 hash is stored in the database. */
export function createConsentToken() {
  const token = randomBytes(32).toString('base64url');
  return { token, hash: hashConsentToken(token) };
}

export function hashConsentToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function validConsentToken(token: unknown): token is string {
  return typeof token === 'string' && /^[A-Za-z0-9_-]{43}$/.test(token);
}

export function validateParentEmail(input: unknown, studentEmail?: string | null) {
  const email = typeof input === 'string' ? input.trim().toLowerCase() : '';
  if (!email || email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return { error: 'Indique une adresse e-mail valide pour ton parent.' } as const;
  if (studentEmail && email === studentEmail.trim().toLowerCase())
    return { error: 'Indique l’adresse de ton parent ou représentant légal, pas la tienne.' } as const;
  return { data: email } as const;
}

export function consentError(error: unknown) {
  const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : '';
  if (message.includes('consent_rate_limit'))
    return 'Une demande vient déjà d’être envoyée. Patiente quelques minutes avant de réessayer (5 envois par jour au maximum).';
  if (message.includes('parent_email_invalid'))
    return 'Indique l’adresse e-mail de ton parent ou représentant légal, différente de la tienne.';
  if (message.includes('consent_not_required')) return 'Aucune autorisation n’est nécessaire pour ce compte.';
  if (message.includes('consent_expired'))
    return 'Ce lien a expiré. Votre enfant peut vous envoyer une nouvelle demande depuis son compte.';
  if (message.includes('consent_unavailable'))
    return 'Ce lien n’est plus valide : il a peut-être été remplacé par une demande plus récente, ou le compte a été supprimé.';
  if (message.includes('birth_date_already_set'))
    return 'Ta date de naissance est déjà enregistrée. Pour la corriger, contacte-nous.';
  if (message.includes('invalid_birth_date')) return 'Vérifie ta date de naissance.';
  if (message.includes('email_not_configured'))
    return 'L’envoi d’e-mails n’est pas encore activé sur Yaka. Réessaie plus tard.';
  if (message.includes('email_failed'))
    return 'L’e-mail n’a pas pu être envoyé. Vérifie l’adresse puis réessaie dans quelques minutes.';
  if (message.includes('schema cache') || message.includes('learning_not_configured'))
    return 'La configuration du serveur n’est pas terminée. Réessaie plus tard.';
  return 'La demande n’a pas abouti. Réessaie dans un instant.';
}
