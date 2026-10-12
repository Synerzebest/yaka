import type { Metadata } from 'next';
import { LegalDocument, LegalContact } from '@/components/legal-document';

export const metadata: Metadata = { title: 'Accessibilité — Yaka' };
export default function Page() {
  return (
    <LegalDocument
      title="Accessibilité"
      intro="Pouvoir apprendre et utiliser le site avec des besoins et des outils différents."
    >
      <section>
        <h2>État actuel</h2>
        <p>
          Yaka comporte des formulaires avec libellés, des boutons et liens utilisables au clavier, des messages de
          réponse annoncés aux technologies d’assistance et des explications textuelles pour plusieurs illustrations.
          Les pages sont adaptées à différentes largeurs d’écran.
        </p>
        <p>
          Aucun audit complet de conformité à un référentiel d’accessibilité n’a encore été réalisé. Cette page ne
          revendique donc aucun niveau de conformité certifié.
        </p>
      </section>
      <section>
        <h2>Limites connues et vérifications à poursuivre</h2>
        <p>
          Les expressions mathématiques sont principalement écrites en texte avec des symboles ; leur lecture par les
          lecteurs d’écran doit être vérifiée. La navigation au clavier, les contrastes, le zoom et l’ensemble des
          supports interactifs doivent encore faire l’objet d’un contrôle systématique.
        </p>
        <p>
          L’applicabilité des obligations relatives à l’accessibilité du service devra être examinée selon l’activité et
          le statut de l’éditeur, notamment avant l’ouverture d’une offre de commerce électronique.
        </p>
      </section>
      <section>
        <h2>Signaler une difficulté</h2>
        <p>
          Contacte <LegalContact subject="Difficulté d’accessibilité sur Yaka" /> en indiquant la page et l’action
          impossible à réaliser. Tu peux demander une explication ou un contenu sous une forme alternative ; l’éditeur
          examinera ta demande.
        </p>
        <p className="legal-source">
          Repère :{' '}
          <a href="https://news.economie.fgov.be/251714-directive-sur-l-accessibilite-un-pas-en-avant-pour-une-societe-plus-inclusive/">
            SPF Économie — accessibilité des services
          </a>
          .
        </p>
      </section>
    </LegalDocument>
  );
}
