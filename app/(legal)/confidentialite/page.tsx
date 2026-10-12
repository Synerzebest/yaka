import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalDocument, LegalContact, LegalField } from '@/components/legal-document';
import { legal, legalValue } from '@/lib/legal';

export const metadata: Metadata = { title: 'Confidentialité et données personnelles — Yaka' };
export default function Page() {
  return (
    <LegalDocument
      title="Tes données et ta vie privée"
      intro="Une explication simple, suivie du détail des traitements liés à ton compte et à ton apprentissage."
    >
      <aside className="legal-summary">
        <h2>Pour toi, en quelques mots</h2>
        <ul>
          <li>Ton e-mail sert à accéder à ton compte. Tu peux utiliser un pseudonyme pour le prénom affiché.</li>
          <li>Tes réponses et réussites servent à garder tes progrès et à te proposer une leçon à retravailler.</li>
          <li>Les autres élèves n’ont pas accès à ton profil ou à tes résultats dans l’application.</li>
          <li>Les essais de découverte ne sont pas ajoutés à ton historique d’exercices.</li>
          <li>
            Tu peux demander une copie de tes données, leur correction ou leur suppression. Si tu hésites, un adulte de
            confiance peut t’aider.
          </li>
        </ul>
        <p>
          Contact pour tes données : <LegalContact privacy />.
        </p>
      </aside>
      <section>
        <h2>1. Qui est responsable ?</h2>
        <p>
          Le responsable du traitement est l’éditeur de Yaka : <strong>{legalValue(legal.publisherName)}</strong>. Ses
          coordonnées complètes figurent dans les <Link href="/mentions-legales">mentions légales</Link>. Pour toute
          question de confidentialité, écris à <LegalContact privacy />. Cette adresse est un point de contact ; elle ne
          signifie pas qu’un délégué à la protection des données a été désigné.
        </p>
      </section>
      <section>
        <h2>2. Quelles données, pour quoi faire ?</h2>
        <div
          className="legal-table-wrap"
          tabIndex={0}
          role="region"
          aria-label="Données, finalités et bases juridiques"
        >
          <table>
            <caption>Traitements prévus pour le service gratuit</caption>
            <thead>
              <tr>
                <th>Données</th>
                <th>Utilisation</th>
                <th>Base juridique</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>E-mail, identifiant de compte, données d’authentification, événements de connexion.</td>
                <td>
                  Créer le compte demandé, vérifier l’adresse, permettre la connexion et la récupération de l’accès.
                </td>
                <td>
                  Exécution du service demandé et mesures précontractuelles (article 6.1.b du RGPD), sous réserve de la
                  validité de la création du compte, notamment pour les mineurs.
                </td>
              </tr>
              <tr>
                <td>
                  Date de naissance ; pour un élève de moins de 13 ans, e-mail du parent, date et version de sa
                  décision.
                </td>
                <td>
                  Savoir si l’autorisation d’un parent ou représentant légal est nécessaire, la demander et en conserver
                  la preuve.
                </td>
                <td>
                  Protection des élèves de moins de 13 ans, en référence à l’article 8 du RGPD et à l’article 7 de la
                  loi belge du 30 juillet 2018. La qualification juridique exacte reste à valider avant la publication.
                </td>
              </tr>
              <tr>
                <td>Prénom ou pseudonyme, année scolaire, objectif d’exercices.</td>
                <td>Personnaliser l’espace élève et présenter le parcours choisi.</td>
                <td>Exécution du service demandé (article 6.1.b).</td>
              </tr>
              <tr>
                <td>
                  Leçons travaillées, énoncés générés, réponses soumises, corrections, dates, nombres d’essais et de
                  réussites.
                </td>
                <td>
                  Corriger les exercices, conserver la progression, calculer les badges et proposer une leçon à
                  retravailler.
                </td>
                <td>Exécution des fonctionnalités d’apprentissage demandées (article 6.1.b).</td>
              </tr>
              <tr>
                <td>
                  Données techniques pouvant inclure adresse IP, informations de navigateur et journaux d’erreurs ou
                  d’authentification.
                </td>
                <td>Assurer le fonctionnement, rechercher un incident et prévenir les accès abusifs.</td>
                <td>
                  Intérêt légitime à la sécurité et à la fiabilité du service (article 6.1.f), avec une mise en balance
                  tenant compte du public mineur.
                </td>
              </tr>
              <tr>
                <td>Coordonnées et contenu des messages adressés au support.</td>
                <td>Répondre aux demandes et résoudre un problème.</td>
                <td>
                  Exécution du service pour l’assistance liée au compte ; intérêt légitime à répondre aux autres
                  questions ; obligation légale pour l’exercice des droits RGPD (article 6.1.c).
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Les informations de compte sont fournies par toi ; les réponses et événements techniques sont produits lors de
          l’utilisation. L’application ne demande ni adresse postale d’élève, ni établissement scolaire, ni données de
          santé, ni coordonnées bancaires. Évite de transmettre de telles informations dans tes messages si elles ne
          sont pas nécessaires.
        </p>
        <p>
          L’e-mail et un mot de passe sont nécessaires à l’accès connecté. Le profil demande un prénom, qui peut être un
          pseudonyme. L’année et l’objectif disposent de valeurs par défaut modifiables. Sans compte, la présentation et
          l’exemple public restent accessibles.
        </p>
        <p>
          La consultation de cette politique ne vaut pas consentement à des traitements facultatifs. Le code actuel
          n’intègre ni publicité ciblée, ni newsletter, ni suivi d’audience. Aucun paiement Stripe n’est actif.
        </p>
      </section>
      <section>
        <h2>3. Comment fonctionnent les recommandations ?</h2>
        <p>
          Yaka utilise des règles automatiques simples : dans l’année choisie, une leçon ayant posé problème est
          priorisée ; sinon, une leçon dont l’objectif d’entraînement n’est pas atteint est proposée. Les badges et
          pourcentages découlent des exercices réussis.
        </p>
        <p>
          Cette personnalisation utilise ton activité d’apprentissage. Elle ne prend aucune décision d’admission
          scolaire, de notation officielle ou d’accès à une formation et n’a pas d’effet juridique ou d’effet
          d’importance comparable. Tu restes libre de choisir une autre leçon. Aucun modèle d’IA externe n’analyse tes
          réponses dans cette version.
        </p>
      </section>
      <section>
        <h2>4. Qui peut accéder aux données ?</h2>
        <p>
          Les personnes autorisées à administrer le service peuvent accéder aux données nécessaires à leur mission.
          Supabase intervient pour l’authentification et la base de données ; les prestataires d’hébergement et
          d’acheminement des e-mails interviennent dans le fonctionnement technique. Des autorités peuvent recevoir des
          informations si une obligation légale l’impose.
        </p>
        <p>
          Les données ne sont pas publiées dans un classement entre élèves. Aucun accès automatique aux résultats n’est
          actuellement proposé aux écoles ou aux parents. Le code ne comporte pas de transmission des résultats à des
          annonceurs.
        </p>
        <dl className="legal-details">
          <LegalField label="Hébergement de l’application" value={legal.websiteHost} />
          <LegalField label="Région principale Supabase" value={legal.supabaseRegion} />
          <LegalField label="Service d’envoi des e-mails" value={legal.emailProvider} />
        </dl>
      </section>
      <section>
        <h2>5. Localisation et transferts internationaux</h2>
        <p>
          L’hébergement prévu est Vercel, un prestataire établi aux États-Unis ; cela ne détermine pas à lui seul la
          région de traitement choisie pour l’application. La région de stockage principale ne suffit pas, à elle seule,
          à décrire tous les accès techniques, sauvegardes et sous-traitants. La liste effective des prestataires et des
          éventuels transferts hors de l’Espace économique européen doit être confirmée pour le déploiement retenu.
        </p>
        <p className={legal.transferSafeguards ? '' : 'legal-missing'}>
          <strong>Pays concernés, garanties applicables et moyen d’en obtenir une copie : </strong>
          {legalValue(legal.transferSafeguards)}
        </p>
        <p>
          Lorsqu’un transfert le nécessite, des garanties appropriées doivent être prévues, par exemple des clauses
          contractuelles types, ou une décision d’adéquation applicable au destinataire. Aucune garantie particulière
          n’est présentée ici comme déjà mise en place.
        </p>
      </section>
      <section>
        <h2>6. Combien de temps ?</h2>
        <p>
          Le compte et les résultats servent à retrouver ton parcours tant que tu utilises le service. À la fermeture,
          les données liées au compte doivent être supprimées, sauf conservation limitée justifiée par une obligation
          légale ou la gestion d’un litige, dont le motif et la durée doivent être précisés. Les règles ci-dessous
          doivent être finalisées et mises en œuvre avant l’ouverture publique.
        </p>
        <dl className="legal-details">
          <LegalField label="Comptes inactifs et historique d’apprentissage" value={legal.inactiveAccountsRetention} />
          <LegalField label="Journaux techniques et de sécurité" value={legal.technicalLogsRetention} />
          <LegalField label="Sauvegardes et délai d’effacement résiduel" value={legal.backupsRetention} />
          <LegalField label="Messages au support et suivi des demandes" value={legal.supportRetention} />
        </dl>
        <p>
          Dans la version technique actuelle, aucun effacement automatique des comptes inactifs n’est configuré. Un
          exercice non répondu expire après une heure pour empêcher sa soumission tardive ; cette expiration ne supprime
          pas son enregistrement. Les durées des cookies sont détaillées <Link href="/cookies">sur cette page</Link>.
        </p>
      </section>
      <section>
        <h2>7. Tes droits et comment les exercer</h2>
        <p>
          Selon les conditions prévues par le RGPD, tu peux demander l’accès et une copie de tes données, leur
          rectification, leur effacement, la limitation du traitement et la portabilité des données concernées. Tu peux
          t’opposer à un traitement fondé sur l’intérêt légitime pour des raisons tenant à ta situation. Si un
          traitement repose sur ton consentement, tu peux le retirer pour l’avenir sans remettre en cause la licéité du
          traitement antérieur.
        </p>
        <p>
          Écris à <LegalContact privacy subject="Exercice de mes droits sur mes données Yaka" /> en indiquant le compte
          concerné et ta demande. Le prénom, l’année et l’objectif peuvent déjà être corrigés dans{' '}
          <Link href="/compte">Mon compte</Link>. Aucun formulaire de suppression automatique n’est disponible à ce
          stade : les demandes sont à traiter par l’éditeur.
        </p>
        <p>
          Ne joins pas systématiquement une pièce d’identité. En cas de doute raisonnable, seules les informations
          supplémentaires nécessaires à la vérification peuvent être demandées. Un représentant légal peut agir pour un
          enfant, avec vérification appropriée de sa qualité.
        </p>
        <p>
          Une réponse doit être apportée sans retard injustifié et, en principe, dans le mois suivant la réception. Une
          prolongation motivée de deux mois peut être nécessaire en cas de complexité ou de demandes nombreuses ; tu
          dois en être informé dans le premier mois. L’exercice des droits est en principe gratuit, sous réserve des
          exceptions légales.
        </p>
      </section>
      <section>
        <h2>8. Protection des mineurs</h2>
        <p>
          Ces informations s’adressent aussi aux élèves : demande de l’aide si un passage n’est pas clair. Il n’est pas
          nécessaire de raconter ta vie privée ou de donner ton nom complet pour résoudre les exercices.
        </p>
        <p>
          En Belgique, le seuil de 13 ans concerne le consentement au traitement de données pour un service en ligne
          directement proposé à l’enfant, lorsque ce traitement repose sur le consentement. Il ne constitue pas une
          capacité générale à conclure n’importe quel contrat. En dessous de ce seuil, dans cette situation,
          l’autorisation du titulaire de la responsabilité parentale doit être obtenue et faire l’objet d’efforts
          raisonnables de vérification.
        </p>
        <p>
          À l’inscription, l’élève indique sa date de naissance. S’il a moins de 13 ans, son compte ne peut enregistrer
          aucun résultat tant que son parent ou représentant légal n’a pas donné son accord via un lien personnel envoyé
          à l’adresse e-mail indiquée. Ce lien permet aussi de refuser ou de retirer l’accord à tout moment, ce qui
          supprime le compte et ses données. Sans réponse, le compte est supprimé après 30 jours. Cette vérification par
          e-mail est un effort raisonnable, pas une preuve certaine de l’autorité parentale. Détails dans les{' '}
          <Link href="/conditions-utilisation">conditions d’utilisation</Link>.
        </p>
      </section>
      <section>
        <h2>9. Réclamation et sécurité</h2>
        <p>
          Tu peux contacter l’éditeur ou introduire une réclamation auprès de l’
          <a href="https://www.autoriteprotectiondonnees.be/citoyen/agir/introduire-une-plainte">
            Autorité de protection des données
          </a>
          , rue de la Presse 35, 1000 Bruxelles, ou auprès d’une autre autorité de contrôle compétente. Cela ne supprime
          pas les autres voies de recours.
        </p>
        <p>
          Les accès aux profils et résultats sont limités au compte concerné dans l’application. Les corrections des
          exercices enregistrés sont réalisées côté serveur. Aucune sécurité n’est absolue : signale un accès suspect à{' '}
          <LegalContact privacy subject="Incident de sécurité Yaka" /> sans transmettre ton mot de passe.
        </p>
        <p>
          Les changements importants de finalité, de destinataires ou de droits doivent être communiqués avant leur mise
          en œuvre ; la version de cette politique est datée en haut de page.
        </p>
      </section>
      <section className="legal-source">
        <h2>Repères officiels</h2>
        <ul>
          <li>
            <a href="https://www.autoriteprotectiondonnees.be/professionnel/rgpd-/droits-des-citoyens/droit-a-l-information">
              APD — informations à fournir
            </a>{' '}
            et <a href="https://www.autoriteprotectiondonnees.be/quels-sont-mes-droits">droits des personnes</a>.
          </li>
          <li>
            <a href="https://www.autoriteprotectiondonnees.be/professionnel/rgpd-/droits-des-citoyens">
              APD — exercice des droits
            </a>{' '}
            et{' '}
            <a href="https://www.autoriteprotectiondonnees.be/professionnel/rgpd-/bases-juridiques/consentement">
              consentement et enfants
            </a>
            .
          </li>
          <li>
            <a href="https://supabase.com/docs/guides/security/gdpr-compliance">
              Supabase — régions, sous-traitance et protection des données
            </a>
            .
          </li>
          <li>
            <a href="https://vercel.com/legal/dpa">Vercel — accord de traitement des données</a>.
          </li>
        </ul>
      </section>
    </LegalDocument>
  );
}
