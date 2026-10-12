import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalDocument, LegalContact } from '@/components/legal-document';
import { legal, legalValue } from '@/lib/legal';

export const metadata: Metadata = { title: 'Conditions d’utilisation — Yaka' };
export default function Page() {
  return (
    <LegalDocument
      title="Conditions d’utilisation"
      intro="Les règles de fonctionnement du service gratuit actuellement proposé aux élèves."
    >
      <section>
        <h2>1. Le service</h2>
        <p>
          Yaka propose des leçons, des situations guidées, des exercices générés et un suivi de progression pour les
          élèves du secondaire général francophone belge. Les parcours de 5e et 6e sont orientés vers les maths 6 h.
        </p>
        <p>
          Les contenus constituent une aide à l’apprentissage, sans remplacer les cours de l’école. Leur classement par
          année est indicatif ; ils ne représentent pas une couverture officielle exhaustive des programmes. Les badges
          et pourcentages mesurent l’entraînement sur Yaka, pas une certification ni une garantie de réussite scolaire.
        </p>
      </section>
      <section>
        <h2>2. Gratuité et accès</h2>
        <p>
          Dans cette version, les fonctionnalités disponibles sont gratuites. Aucun abonnement payant, paiement, essai
          avec conversion automatique ou renouvellement facturé n’est proposé. Aucune carte bancaire n’est demandée.
        </p>
        <p>
          Une connexion internet et un navigateur compatible sont nécessaires. La présentation et l’exemple public sont
          accessibles sans compte. Les cours complets et l’enregistrement des exercices nécessitent un compte.
        </p>
        <p>
          Si une offre payante est créée, ses prix, conditions de vente, modalités de résiliation et droits applicables
          seront communiqués avant toute commande. Ces conditions ne permettent aucun prélèvement futur sans commande
          explicite.
        </p>
      </section>
      <section>
        <h2>3. Ton compte</h2>
        <p>
          Utilise une adresse e-mail à laquelle tu as accès et un prénom ou pseudonyme pour ton profil. Garde ton mot de
          passe confidentiel et déconnecte-toi sur un appareil partagé. Si tu penses qu’une autre personne utilise ton
          compte, change ton mot de passe et contacte <LegalContact />.
        </p>
        <p>
          Tu peux modifier ton profil depuis <Link href="/compte">Mon compte</Link>. Les essais guidés de découverte ne
          sont pas enregistrés dans la progression ; les exercices soumis avec ton compte le sont.
        </p>
      </section>
      <section>
        <h2>4. Élèves mineurs et accompagnement</h2>
        <p>
          Si tu es mineur, fais-toi accompagner par ton parent ou représentant légal pour comprendre le fonctionnement
          du compte et ces conditions. L’accès d’un mineur doit respecter les règles applicables à sa capacité à
          conclure un contrat et, lorsque le traitement repose sur le consentement, les règles relatives au consentement
          parental.
        </p>
        <p className={legal.minorAccountProcedure ? '' : 'legal-missing'}>
          <strong>Modalités de création et d’autorisation des comptes de mineurs : </strong>
          {legalValue(legal.minorAccountProcedure)}
        </p>
        <p>
          Un élève de moins de 13 ans peut créer son compte, mais aucun exercice n’est enregistré tant que son parent ou
          représentant légal ne l’a pas autorisé via le lien reçu par e-mail. Le parent peut refuser ou retirer son
          accord avec ce même lien : le compte et ses données sont alors supprimés. La date de naissance ne peut pas
          être modifiée par l’élève après l’inscription ; une correction se demande via la page contact.
        </p>
      </section>
      <section>
        <h2>5. Un usage respectueux</h2>
        <p>
          Utilise le service pour apprendre. N’essaie pas d’accéder aux données d’un autre élève, d’usurper son
          identité, de contourner les protections, de falsifier les résultats ou de perturber le fonctionnement du site
          par des requêtes abusives.
        </p>
        <p>
          Les exercices se renouvellent à la demande, sous réserve de limites techniques destinées à protéger le
          service. Le site n’héberge actuellement ni messagerie entre élèves ni publications publiques de leurs
          réponses.
        </p>
      </section>
      <section>
        <h2>6. Disponibilité, contenu et responsabilité</h2>
        <p>
          Des interruptions peuvent survenir, notamment pour la maintenance ou en cas de panne. Signale les difficultés
          rencontrées pour permettre leur correction. Les contenus évoluent et une erreur pédagogique peut être signalée
          depuis la <Link href="/contact">page de contact</Link>.
        </p>
        <p>
          L’éditeur répond de ses obligations selon le droit applicable. Aucune disposition de ces conditions n’exclut
          une responsabilité ou une garantie qui ne peut légalement être écartée, ni les droits impératifs des
          consommateurs.
        </p>
      </section>
      <section>
        <h2>7. Fin d’utilisation et suspension</h2>
        <p>
          Tu peux cesser d’utiliser Yaka et demander la fermeture de ton compte à{' '}
          <LegalContact privacy subject="Fermeture de mon compte Yaka" />. Les modalités d’effacement et les éventuelles
          exceptions légales sont décrites dans la politique de confidentialité.
        </p>
        <p>
          En cas de risque pour la sécurité ou d’abus, l’accès peut être restreint de manière proportionnée.
          L’utilisateur est informé du motif, sauf si cette information compromet une enquête ou une mesure de sécurité,
          et peut demander un réexamen auprès de l’éditeur.
        </p>
      </section>
      <section>
        <h2>8. Évolution des conditions</h2>
        <p>
          La date de version figure en haut de cette page. Les modifications importantes doivent être portées à la
          connaissance des utilisateurs avant leur application. Elles ne peuvent supprimer rétroactivement des droits
          acquis. Une acceptation distincte sera demandée lorsqu’elle est requise.
        </p>
      </section>
      <section>
        <h2>9. Questions et désaccords</h2>
        <p>
          Adresse d’abord ta demande à <LegalContact />. Le droit belge s’applique, sans priver un consommateur des
          protections impératives dont il bénéficie dans son pays de résidence lorsque celles-ci s’appliquent. La
          compétence des juridictions est déterminée par les règles légales ; aucune compétence exclusive n’est imposée
          au détriment du consommateur.
        </p>
      </section>
    </LegalDocument>
  );
}
