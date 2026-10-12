'use server';

import { revalidatePath } from 'next/cache';
import { formatDate, validateBirthDate } from '@/lib/age';
import { escapeHtml, sendEmail, siteUrl } from '@/lib/mailer';
import {
  consentError,
  consentNoticeVersion,
  createConsentToken,
  validateParentEmail,
  type Access,
} from '@/lib/parental-consent';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

type Result = { access: Access } | { error: string };

async function authenticated() {
  const client = await createClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) return null;
  return { client, user };
}

export async function saveBirthDate(formData: FormData): Promise<Result> {
  const validated = validateBirthDate(formData.get('birth_date'));
  if ('error' in validated) return { error: validated.error! };
  try {
    const auth = await authenticated();
    if (!auth) return { error: 'Reconnecte-toi pour continuer.' };
    // The database refuses a second change: a student cannot age up to skip the parental step.
    const { data, error } = await auth.client.rpc('set_my_birth_date', { p_birth_date: validated.data });
    if (error) return { error: consentError(error) };
    revalidatePath('/', 'layout');
    return { access: data as Access };
  } catch (error) {
    return { error: consentError(error) };
  }
}

export async function requestParentalConsent(formData: FormData): Promise<Result> {
  try {
    const auth = await authenticated();
    if (!auth) return { error: 'Reconnecte-toi pour continuer.' };
    const validated = validateParentEmail(formData.get('parent_email'), auth.user.email);
    if ('error' in validated) return { error: validated.error! };
    const site = siteUrl();
    if (!site) return { error: consentError(new Error('email_not_configured')) };

    const { token, hash } = createConsentToken();
    const admin = createAdminClient();
    const { data: request, error } = await admin.rpc('server_request_parental_consent', {
      p_user_id: auth.user.id,
      p_parent_email: validated.data,
      p_token_hash: hash,
      p_notice_version: consentNoticeVersion,
    });
    if (error) return { error: consentError(error) };

    const sent = await sendEmail(
      consentEmail({
        to: validated.data,
        name: request.displayName,
        studentEmail: auth.user.email ?? '',
        link: `${site}/autorisation-parentale?jeton=${token}`,
        privacy: `${site}/confidentialite`,
        expiresAt: request.expiresAt,
      }),
    );
    if ('error' in sent) return { error: consentError(new Error(sent.error)) };

    const { data: access, error: accessError } = await auth.client.rpc('get_my_access');
    if (accessError) return { error: consentError(accessError) };
    return { access: access as Access };
  } catch (error) {
    return { error: consentError(error) };
  }
}

function consentEmail({
  to,
  name,
  studentEmail,
  link,
  privacy,
  expiresAt,
}: {
  to: string;
  name: string;
  studentEmail: string;
  link: string;
  privacy: string;
  expiresAt: string;
}) {
  const paragraphs = [
    'Bonjour,',
    `${name} a créé un compte sur Yaka, un site d’entraînement aux mathématiques pour l’enseignement secondaire en Belgique, avec l’adresse ${studentEmail}.`,
    'Cet élève a indiqué avoir moins de 13 ans. Son compte ne peut donc pas enregistrer de résultats sans l’accord de son parent ou représentant légal.',
    `Pour lire les informations et autoriser ou refuser ce compte, ouvrez ce lien (valable jusqu’au ${formatDate(expiresAt)}) :`,
    link,
    'Données traitées : adresse e-mail, prénom ou pseudonyme, date de naissance, année scolaire, objectif choisi et résultats des exercices. Elles servent uniquement au fonctionnement du compte. Aucune publicité, aucune revente.',
    `Politique de confidentialité : ${privacy}`,
    'Vous ne connaissez pas cet élève ? Ignorez ce message : sans autorisation, le compte sera supprimé après 30 jours.',
    'L’équipe Yaka',
  ];
  return {
    to,
    subject: `Yaka : autorisation demandée pour le compte de ${name}`,
    text: paragraphs.join('\n\n'),
    html: paragraphs
      .map(paragraph =>
        paragraph === link
          ? `<p><a href="${escapeHtml(link)}">Autoriser ou refuser le compte</a></p>`
          : `<p>${escapeHtml(paragraph)}</p>`,
      )
      .join(''),
  };
}
