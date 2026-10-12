import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalDocument, LegalField, LegalContact } from '@/components/legal-document';
import { legal } from '@/lib/legal';

export const metadata: Metadata = { title: 'Mentions légales — Yaka' };
export default function Page() {
  return (
    <LegalDocument
      title="Mentions légales"
      intro="Qui propose Yaka, comment joindre l’éditeur et quels prestataires font fonctionner le site."
    >
      <section>
        <h2>1. Éditeur du site</h2>
        <p>Yaka est le nom du service d’apprentissage. L’identité juridique de son éditeur figure ci-dessous.</p>
        <dl className="legal-details">
          <LegalField label="Nom ou dénomination légale" value={legal.publisherName} />
          <LegalField label="Forme juridique / statut" value={legal.legalForm} />
          <LegalField label="Adresse d’établissement" value={legal.postalAddress} />
          <LegalField label="Numéro d’entreprise (BCE)" value={legal.enterpriseNumber} />
          <LegalField label="Numéro de TVA ou situation d’assujettissement" value={legal.vatStatus} />
          <LegalField label="Téléphone" value={legal.phone} />
          <div>
            <dt>E-mail</dt>
            <dd>
              <LegalContact />
            </dd>
          </div>
        </dl>
      </section>
      <section>
        <h2>2. Hébergement et prestataires techniques</h2>
        <dl className="legal-details">
          <LegalField label="Hébergeur de l’application web" value={legal.websiteHost} />
          <LegalField label="Adresse de l’hébergeur" value={legal.hostAddress} />
          <div>
            <dt>Authentification et base de données</dt>
            <dd>Supabase. Les comptes et résultats sont traités via ce prestataire.</dd>
          </div>
          <LegalField label="Région du projet Supabase" value={legal.supabaseRegion} />
          <LegalField label="Acheminement des e-mails de connexion" value={legal.emailProvider} />
        </dl>
        <p>
          Adresse de Vercel publiée dans sa <a href="https://vercel.com/legal/privacy-notice">notice officielle</a>. Les
          catégories de données et les informations relatives aux transferts figurent dans la{' '}
          <Link href="/confidentialite">politique de confidentialité</Link>.
        </p>
      </section>
      <section>
        <h2>3. Contenus et propriété intellectuelle</h2>
        <p>
          Les textes, illustrations, interfaces et contenus originaux de Yaka sont protégés selon les règles
          applicables. Les élèves peuvent les consulter et les utiliser pour leur apprentissage personnel. Les
          exceptions légales, notamment celles relatives à la citation et à l’enseignement lorsqu’elles s’appliquent,
          restent préservées.
        </p>
        <p>
          Pour une republication ou une exploitation commerciale dépassant ces usages, contacte l’éditeur. Les marques
          et composants tiers conservent leurs titulaires et licences respectifs.
        </p>
      </section>
      <section>
        <h2>4. Signaler une erreur ou un problème</h2>
        <p>
          Une erreur de cours, un problème technique ou une question sur un contenu ? Écris à{' '}
          <LegalContact subject="Signalement concernant Yaka" /> en précisant la page concernée. Ne joins pas ton mot de
          passe ni les informations personnelles d’autres élèves.
        </p>
      </section>
      <section>
        <h2>5. Textes applicables au service</h2>
        <p>
          Consulte les <Link href="/conditions-utilisation">conditions d’utilisation</Link>, la{' '}
          <Link href="/confidentialite">confidentialité</Link> et les{' '}
          <Link href="/cookies">informations sur les cookies</Link>.
        </p>
        <p className="legal-source">
          Repère officiel :{' '}
          <a href="https://economie.fgov.be/fr/themes/line/commerce-electronique/vente-par-internet/site-dentreprise-et-comptes">
            SPF Économie — identification d’un site d’entreprise
          </a>
          .
        </p>
      </section>
    </LegalDocument>
  );
}
