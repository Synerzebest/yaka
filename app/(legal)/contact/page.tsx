import type { Metadata } from 'next';
import { LegalDocument, LegalContact, LegalField } from '@/components/legal-document';
import { legal } from '@/lib/legal';

export const metadata: Metadata = { title: 'Contact et demandes relatives aux données — Yaka' };
export default function Page() {
  return (
    <LegalDocument
      title="Contacter Yaka"
      intro="Une question, une erreur dans un cours ou une demande concernant tes données ?"
    >
      <section>
        <h2>Une question sur le service</h2>
        <p>
          Écris à <LegalContact subject="Question sur Yaka" />. Pour un problème technique, indique la page concernée et
          ce que tu essayais de faire. Pour une erreur mathématique, recopie l’énoncé sans ajouter d’informations sur
          d’autres élèves.
        </p>
        <dl className="legal-details">
          <LegalField label="Téléphone" value={legal.phone} />
          <LegalField label="Adresse postale de l’éditeur" value={legal.postalAddress} />
        </dl>
      </section>
      <section id="donnees">
        <h2>Ton compte et tes données</h2>
        <p>
          Pour demander une copie de tes données, une rectification ou la suppression de ton compte :{' '}
          <LegalContact privacy subject="Demande concernant mes données Yaka" />.
        </p>
        <p>
          Précise l’adresse liée au compte et le résultat attendu. Ne communique jamais ton mot de passe. Un parent ou
          représentant légal peut demander de l’aide pour le compte d’un enfant ; sa qualité pourra devoir être
          vérifiée.
        </p>
        <p>
          Le lien ouvre ton application de messagerie. Rien n’est envoyé automatiquement et cette page n’enregistre pas
          de message. Si aucune messagerie ne s’ouvre, copie l’adresse dans ton service e-mail habituel.
        </p>
      </section>
      <section>
        <h2>Un obstacle d’accessibilité</h2>
        <p>
          Décris le blocage rencontré, la page et, si cela aide, le navigateur ou l’outil d’assistance utilisé :{' '}
          <LegalContact subject="Accessibilité de Yaka" />. Tu n’as pas besoin de communiquer un diagnostic médical.
        </p>
      </section>
    </LegalDocument>
  );
}
