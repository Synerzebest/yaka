import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalLinks } from '@/components/legal-links';
import { ParentalDecision } from '@/components/parental-decision';
import { formatDate } from '@/lib/age';
import { consentError, hashConsentToken, validConsentToken } from '@/lib/parental-consent';
import { createAdminClient } from '@/lib/supabase/admin';

// The link carries a secret: never index it, never send it to another site in a Referer header.
export const metadata: Metadata = {
  title: 'Autorisation parentale — Yaka',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

type ConsentPage = {
  status: 'pending' | 'granted' | 'expired';
  displayName: string;
  studentEmail: string | null;
  birthDate: string | null;
  schoolYear: number;
  parentEmail: string;
  expiresAt: string;
  grantedAt: string | null;
};

async function loadConsent(token: string | undefined): Promise<{ consent: ConsentPage } | { error: string }> {
  if (!validConsentToken(token)) return { error: consentError(new Error('consent_unavailable')) };
  try {
    const { data, error } = await createAdminClient().rpc('server_get_parental_consent', {
      p_token_hash: hashConsentToken(token),
    });
    if (error) return { error: consentError(error) };
    return { consent: data as ConsentPage };
  } catch (error) {
    return { error: consentError(error) };
  }
}

export default async function ParentalConsentPage({ searchParams }: { searchParams: Promise<{ jeton?: string }> }) {
  const { jeton } = await searchParams;
  const result = await loadConsent(jeton);

  return (
    <div className="auth-page">
      <div className="auth-card consent-card">
        <Link className="auth-logo" href="/">
          yaka.
        </Link>
        <div className="eyebrow">AUTORISATION PARENTALE</div>
        {'error' in result ? (
          <>
            <h1>Ce lien ne fonctionne pas.</h1>
            <p className="auth-message error">{result.error}</p>
          </>
        ) : (
          <>
            <h1>Le compte Yaka de {result.consent.displayName}</h1>
            <p className="auth-intro">
              Cet élève a indiqué avoir moins de 13 ans. Yaka a besoin de votre accord, en tant que parent ou
              représentant légal, pour enregistrer son compte et ses résultats.
            </p>
            <dl className="consent-details">
              <dt>Prénom ou pseudonyme</dt>
              <dd>{result.consent.displayName}</dd>
              {result.consent.studentEmail && (
                <>
                  <dt>Adresse du compte</dt>
                  <dd>{result.consent.studentEmail}</dd>
                </>
              )}
              {result.consent.birthDate && (
                <>
                  <dt>Date de naissance déclarée</dt>
                  <dd>{formatDate(result.consent.birthDate)}</dd>
                </>
              )}
              <dt>Année scolaire</dt>
              <dd>
                {result.consent.schoolYear}
                {result.consent.schoolYear === 1 ? 're' : 'e'} secondaire
              </dd>
            </dl>
            <section className="consent-information">
              <h2>Ce que fait Yaka</h2>
              <p>
                Yaka propose des leçons et des exercices de mathématiques pour le secondaire. Le compte conserve
                l’adresse e-mail, le prénom ou pseudonyme, la date de naissance, l’année scolaire, l’objectif choisi et
                les résultats des exercices. Ces données servent uniquement au fonctionnement du compte et au suivi de
                la progression : pas de publicité, pas de revente, pas de profil commercial.
              </p>
              <p>
                Votre adresse ({result.consent.parentEmail}), la date et la version de ces informations sont conservées
                comme preuve de votre décision. Vous pourrez retirer votre autorisation à tout moment avec ce même lien
                ou en écrivant à l’adresse indiquée sur la page <Link href="/contact">contact</Link>. Détails :{' '}
                <Link href="/confidentialite">politique de confidentialité</Link> et{' '}
                <Link href="/conditions-utilisation">conditions d’utilisation</Link>.
              </p>
            </section>
            <ParentalDecision
              token={jeton!}
              status={result.consent.status}
              name={result.consent.displayName}
              grantedAt={result.consent.grantedAt}
              expiresAt={result.consent.expiresAt}
            />
          </>
        )}
        <LegalLinks />
      </div>
    </div>
  );
}
