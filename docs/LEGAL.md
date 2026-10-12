# Textes légaux et mise en service de Yaka

État au 12 octobre 2026. Ces pages sont une base rédactionnelle contextualisée au code, pas une attestation de conformité. Les informations encore inconnues sont visibles et la publication définitive reste à préparer avec l’éditeur et, pour les choix juridiques, un professionnel compétent en droit belge et protection des mineurs.

## Pages intégrées

- `/mentions-legales` : identité, contacts, hébergement, propriété intellectuelle.
- `/conditions-utilisation` : service gratuit, comptes, usage, responsabilité sans exclusion générale, fermeture, litiges.
- `/confidentialite` : résumé pour les élèves, données et finalités, bases proposées, destinataires, transferts, durées, recommandations automatiques, droits, mineurs, APD.
- `/cookies` : inventaire observé, durées réelles de la bibliothèque, stockage local historique, suppression et distinction avec la suppression du compte.
- `/contact` : liens e-mail, demandes de droits, signalement pédagogique ou d’accessibilité. Pas de formulaire fictif ou de message envoyé automatiquement.
- `/accessibilite` : mesures présentes, limites connues et absence d’audit complet, contact. Ce n’est pas une déclaration de conformité certifiée.

Les liens sont accessibles hors connexion, dans l’accueil, le formulaire de connexion/inscription, le compte et la navigation élève. Le formulaire d’inscription affiche une information sur les données et les conditions ; il ne prétend pas enregistrer une acceptation probante des CGU. Aucun consentement marketing ou cookie facultatif n’est demandé.

## Autorisation parentale des moins de 13 ans (implémentée)

Migration `004_formats_and_parental_consent.sql`, pages `/bienvenue` et `/autorisation-parentale`.

- **Date de naissance** demandée à l’inscription (ou à la première connexion pour les comptes existants), recopiée dans `profiles.birth_date`. L’élève ne peut la saisir qu’une fois : la colonne n’est pas modifiable par le navigateur et `set_my_birth_date` refuse un second changement, sinon il suffirait de se vieillir. Une correction se fait via le contact puis en SQL.
- **Blocage dans la base** : `private.access_status` calcule l’âge en heure de Bruxelles. Sous 13 ans sans autorisation, `server_create_exercise` refuse toute génération ; l’espace élève redirige vers `/bienvenue`. La fermeture est stricte : si la migration 004 manque, l’espace élève refuse l’accès au lieu de l’ouvrir.
- **Demande au parent** : l’élève saisit l’adresse de son parent (différente de la sienne). Un jeton aléatoire de 256 bits est envoyé par e-mail ; seule son empreinte SHA-256 est stockée (`private.parental_consents`). Lien valable 7 jours ; un renvoi invalide le précédent ; 2 minutes entre deux envois et 5 envois par 24 h au maximum.
- **Décision du parent** : ouvrir le lien n’a aucun effet (les clients mail ouvrent parfois les liens automatiquement). Autoriser exige de cocher « je suis le parent ou représentant légal » ; refuser ou retirer l’accord exige une confirmation et **supprime le compte** (cascade sur profil, résultats et demande). Sont conservés : adresse du parent, date, version de l’information (`consentNoticeVersion` dans `lib/parental-consent.ts`, à changer quand le texte change).
- **Purge** : `select private.purge_unconsented_minor_accounts();` supprime les comptes de moins de 13 ans sans accord créés il y a plus de 30 jours. **Elle n’est pas planifiée** : l’activer avec pg_cron (Supabase → Integrations → Cron) ou la lancer régulièrement. Les e-mails et pages annoncent ce délai de 30 jours.
- **Limites** : la vérification par e-mail est un effort raisonnable, pas une preuve de l’autorité parentale ; un élève peut déclarer une fausse date ou saisir une adresse qu’il contrôle. La base juridique exacte (consentement au sens de l’article 8 RGPD ou autre) reste à valider : voir le point 1 ci-dessous.
- **Prestataire e-mail** : `lib/mailer.ts` utilise l’API Resend (`RESEND_API_KEY`, `EMAIL_FROM`). À déclarer dans `emailProvider`, avec ses garanties de transfert. En production sans clé, aucune demande n’est envoyée et l’élève voit un message explicite.

## Configuration à compléter

Modifier `content/legal-config.json`, puis reconstruire l’application.

| Champ | Information ou décision attendue |
|---|---|
| publisherName, legalForm, postalAddress | Identité réelle du responsable/éditeur, statut, adresse d’établissement |
| enterpriseNumber, vatStatus | Numéro BCE et numéro de TVA ou situation applicable |
| contactEmail, privacyEmail | `contact@yaka.be` fourni par le propriétaire ; activer et tester la boîte, organiser son suivi |
| phone | Contact téléphonique professionnel |
| websiteHost, hostAddress | Vercel prévu, adresse issue de sa notice officielle ; vérifier l’entité contractante au déploiement |
| supabaseRegion | Région réelle affichée dans le projet ; ne pas déduire une résidence UE du domaine du service |
| emailProvider | SMTP transactionnel et prestataire de la boîte de support si distinct ; le service par défaut de Supabase peut déjà intervenir |
| transferSafeguards | Pays/destinataires réels, accords de sous-traitance applicables, mécanismes et garanties des transferts, moyen d’en obtenir une copie |
| inactiveAccountsRetention | Durée ou critères justifiés, préavis éventuel et procédure d’effacement à implémenter |
| technicalLogsRetention, backupsRetention | Durées réellement configurées chez les prestataires et gestion de l’effacement résiduel |
| supportRetention | Conservation des échanges de support et traces strictement nécessaires du traitement des droits |
| minorAccountProcedure | Rempli d’après le parcours implémenté (voir ci-dessous) ; à relire avec la validation juridique |
| reviewedForPublication | Passer à true uniquement après finalisation des textes ET des pratiques décrites |

`npm run check:legal` signale les informations manquantes. Il n’est pas lancé automatiquement pendant le build : le développement reste utilisable. Le bandeau et `noindex` ne constituent pas une restriction d’accès, un blocage des inscriptions ni une mesure suffisante pour ouvrir le service à des mineurs.

## Travaux opérationnels avant ouverture publique

1. **Mineurs et base juridique.** Valider la capacité contractuelle et la base juridique du parcours parental décrit ci-dessus. Le seuil belge de 13 ans s’applique au consentement pour certains services en ligne, pas à toute base légale ni à tout contrat. Le parcours implémenté n’interdit pas les moins de 13 ans : il bloque l’enregistrement jusqu’à l’accord du parent obtenu par e-mail. Planifier la purge à 30 jours avant l’ouverture.
2. **CGU.** Finaliser les conditions avant d’organiser leur acceptation et l’archivage proportionné de la version et de la preuve d’acceptation. Les métadonnées de profil modifiables par l’élève ne constituent pas un registre immuable. Ne pas présenter l’information de confidentialité comme un consentement global.
3. **Conservation.** Choisir des durées justifiées et implémenter leur application. Actuellement aucune purge des comptes inactifs n’existe. L’expiration d’une instance après une heure ne supprime pas sa ligne. Attention : supprimer des instances en cascade supprime les tentatives associées et affecte le calcul des statistiques ; une politique de purge doit préserver ou recalculer correctement les agrégats.
4. **Demandes de droits.** Assurer le suivi de contact@yaka.be, vérifier l’identité de façon proportionnée, rechercher les données du compte et les éventuels échanges/journaux, répondre dans les délais applicables. Pour un export, ne jamais inclure de mot de passe haché, de jeton ou de clé serveur. Ne pas limiter l’accès aux premières 1 000 lignes d’une réponse Supabase : paginer l’historique. Un export de l’application ne couvre pas forcément les journaux des prestataires.
5. **Effacement.** La suppression d’un utilisateur via l’administration Supabase entraîne les cascades prévues vers les profils et résultats. Vérifier séparément les journaux, sauvegardes, e-mails et exceptions de conservation, et le délai de validité des jetons déjà émis. Ne pas promettre un effacement immédiat de toutes les copies. La suppression automatique en libre-service n’est pas implémentée.
6. **Prestataires.** Confirmer les configurations Vercel, Supabase et SMTP, les régions, sous-traitants, accords de traitement et garanties de transfert. Un hébergement primaire européen ne prouve pas que tout traitement reste dans l’EEE. Vérifier les éventuelles options Vercel activées dans le tableau de bord, absentes du dépôt.
7. **Cookies.** La version installée de `@supabase/ssr` utilise par défaut 400 jours pour les écritures de cookies ; certaines branches imposent cette valeur après la fusion de `cookieOptions`. Ne pas supposer qu’un simple `cookieOptions.maxAge` la réduit. Revoir et tester ensemble les écritures navigateur, serveur et proxy pour adapter la durée au besoin réel, y compris les flux PKCE abandonnés. Mettre ensuite à jour `/cookies`. Aucun traceur facultatif n’est actuellement intégré au code.
8. **Protection des données.** Documenter les traitements, la mise en balance pour la sécurité, les mesures d’accès, le traitement des incidents et examiner la nécessité d’une analyse d’impact au regard du suivi d’apprentissage de mineurs. Une notice ne remplace pas ces travaux.
9. **Accessibilité.** Vérifier le champ d’application selon l’activité et la taille de l’entreprise, puis auditer notamment clavier, lecteurs d’écran, notation mathématique, zoom, contrastes et exercices. Ne pas revendiquer un niveau de conformité sans évaluation.

## Avant toute offre payante

Stripe n’est pas connecté au parcours utilisateur. Les CGU décrivent donc le service gratuit ; aucune CGV fictive ou renonciation anticipée à des droits n’est présentée.

Avant une commande, préparer les informations et CGV adaptées au service vendu : caractéristiques et compatibilité, prix TVA comprise et périodicité, durée, renouvellement, résiliation, exécution, garanties applicables aux services/contenus numériques, réclamations et règlement extrajudiciaire lorsqu’applicable. Déterminer les modalités du droit de rétractation et fournir le formulaire lorsqu’il est requis. Distinguer contenu numérique et service numérique avant de prévoir une demande d’exécution immédiate ou une éventuelle perte du droit : ne pas appliquer une renonciation générique à tous les abonnements.

Implémenter aussi la commande avec obligation de paiement explicite, la confirmation sur support durable, le parcours du payeur majeur, l’archivage des versions acceptées, la facturation et l’information de confidentialité relative à Stripe. Le changement nécessite du développement et de nouveaux textes, pas seulement l’activation d’une clé.

## Sources officielles consultées

- SPF Économie : https://economie.fgov.be/fr/themes/line/commerce-electronique/vente-par-internet/site-dentreprise-et-comptes
- SPF Économie, informations e-commerce : https://economie.fgov.be/fr/themes/entreprises/guidance/pratiques-commerciales/obligations-dinformation-dans/questions-frequemment-posees
- APD, information : https://www.autoriteprotectiondonnees.be/professionnel/rgpd-/droits-des-citoyens/droit-a-l-information
- APD, droits : https://www.autoriteprotectiondonnees.be/quels-sont-mes-droits et https://www.autoriteprotectiondonnees.be/professionnel/rgpd-/droits-des-citoyens
- APD, consentement et enfants : https://www.autoriteprotectiondonnees.be/professionnel/rgpd-/bases-juridiques/consentement
- APD, cookies : https://www.autoriteprotectiondonnees.be/citoyen/themes/internet/cookies
- APD, contact : https://www.autoriteprotectiondonnees.be/citoyen/agir/contact
- SPF Économie, accessibilité : https://news.economie.fgov.be/251714-directive-sur-l-accessibilite-un-pas-en-avant-pour-une-societe-plus-inclusive/
- Vercel : https://vercel.com/legal/privacy-notice et https://vercel.com/legal/dpa
- Supabase : https://supabase.com/docs/guides/security/gdpr-compliance

Les observations sur les fonctionnalités et cookies viennent aussi du code et des bibliothèques installées. Recontrôler les textes et cette documentation lorsque les pratiques changent.
