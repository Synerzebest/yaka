# Yaka

Une première version Next.js 16 / React 19 pour apprendre les mathématiques dans le secondaire belge. Interface française, responsive, avec comptes Supabase et mode découverte.

## Démarrer

```sh
npm install
npm run dev
```

Ouvrir http://localhost:3000. `npm run lint` vérifie le code et `npm run format` le met en forme (Prettier). `npm test` vérifie les 126 modèles d’exercices, les formats de réponse, les arrondis, les parcours par année, l’âge et le consentement parental, le stockage local et la cohérence du SQL (Node 22.6+). `npm run build` produit la version de production. Si l’environnement bloque les ports internes de Turbopack, utiliser `npm run build -- --webpack`.

## Connexion Supabase

Les scripts `supabase/migrations/001_initial_schema.sql` et `supabase/seed.sql` ont été exécutés par le propriétaire du projet. La lecture des trois chapitres et trois leçons a été vérifiée depuis l’application. **Il n’est pas nécessaire de rejouer la migration initiale.**

Pour ajouter les six années dans le projet existant, exécuter maintenant **`supabase/migrations/002_curriculum_all_years.sql`** dans le SQL Editor. Ce fichier ajoute les métadonnées pédagogiques, élargit les types d’exercices et insère/met à jour 42 leçons réparties en 22 chapitres. Il est rejouable et conserve les identifiants, comptes et résultats existants. Il met à jour les textes des leçons du catalogue Yaka : sauvegarder d’éventuelles modifications éditoriales personnelles avant de le rejouer.

La migration 002 a été testée deux fois sur une base PostgreSQL locale avec les migrations précédentes et des données de contrôle. Elle n’a pas été exécutée sur ton projet distant. Les 42 leçons sont déjà accessibles via le catalogue local en attendant cette opération.

Le fichier `.env.local` contient l’URL du projet et sa clé publique et reste exclu de Git. Sur une autre machine, reprendre les variables de `.env.example` :

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=votre-cle-publique
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Redémarrer `npm run dev` après modification de ces valeurs. Sans configuration Supabase, la page publique et son exemple interactif restent accessibles. La clé publique suffit pour l’authentification, les cours et les profils. Pour les exercices connectés, `SUPABASE_SERVICE_ROLE_KEY` doit contenir la clé serveur (service_role ou clé secrète Supabase). Elle est chargée uniquement dans `lib/supabase/admin.ts`, protégé par `server-only`.

### Réglage des liens d’authentification

Dans Supabase → Authentication → URL Configuration :

- Site URL : `http://localhost:3000` pour le développement.
- Redirect URLs : `http://localhost:3000/auth/callback` et `http://localhost:3000/auth/callback?next=/mot-de-passe`.
- En production (domaine `yakamaths.be`) : Site URL `https://yakamaths.be`, et ajouter `https://yakamaths.be/auth/callback` et `https://yakamaths.be/auth/callback?next=/mot-de-passe` aux Redirect URLs.
- Dans Vercel, `NEXT_PUBLIC_SITE_URL=https://yakamaths.be` et `EMAIL_FROM=Yaka <contact@yakamaths.be>` (domaine vérifié dans Resend). Redéployer après tout changement de variable.

Le formulaire utilise Supabase Auth par e-mail et mot de passe. Le template e-mail Supabase par défaut, avec `{{ .ConfirmationURL }}`, est compatible avec le callback PKCE. Ouvrir alors le lien dans le navigateur ayant lancé la demande.

Pour permettre une confirmation depuis un autre navigateur, remplacer le lien du template **Confirm signup** par :

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirmer mon inscription</a>
```

Pour le template **Reset password**, le lien équivalent est :

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery">Choisir un nouveau mot de passe</a>
```

Ces templates utilisent la Site URL : choisir celle de l’environnement à tester. Ces réglages n’ont pas été modifiés à distance par l’application. Le service e-mail Supabase par défaut peut limiter les destinataires et le débit ; configurer son SMTP avant l’ouverture aux élèves. Voir les guides officiels [SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client) et [e-mails et mots de passe](https://supabase.com/docs/guides/auth/passwords).

## Disponible

- `/` : présentation publique de Yaka pour les visiteurs ; tableau de bord pour les utilisateurs authentifiés.
- Exemple interactif public sans compte : théorie, analogie et résolution d’une équation, sans progression enregistrée.
- `/connexion` : connexion et récupération du mot de passe ; `/connexion?mode=inscription` ouvre directement l’inscription.
- `/auth/callback` et `/auth/confirm` : validation des liens et établissement de la session.
- `/compte` : page protégée, modification du prénom, de l’année scolaire et de l’objectif, déconnexion.
- `/mot-de-passe` : choix d’un nouveau mot de passe après récupération du compte.
- Tableau de bord : profil connecté, année de la 1re à la 6e secondaire, cours, progression et badges.
- Catalogue de **42 leçons sur les six années** : 6 par année de la 1re à la 4e, puis 9 en 5e et 9 en 6e, avec une orientation **maths 6 h** au troisième degré.
- Chaque leçon contient théorie, méthode en trois étapes, exemple résolu, analogie, piège classique et exercices adaptés.
- Lecture du contenu et des métadonnées depuis Supabase, avec catalogue local de secours avant migration ou en cas de panne.
- Le changement d’année filtre les cours, les recommandations et le pourcentage de progression. Les statistiques cumulées et badges restent toutes années confondues.
- Exercices aléatoires : **trois modèles par leçon**, réponses en nombre, en QCM ou en expression développée en x ; validation des fractions équivalentes et décimaux, explications déterministes de certaines erreurs fréquentes. L’exercice suivant évite le modèle précédent.
- Date de naissance à l’inscription. **Sous 13 ans, le compte reste bloqué jusqu’à l’autorisation du parent**, demandée par e-mail depuis `/bienvenue` et donnée ou refusée sur `/autorisation-parentale`.

**Les profils et les résultats des comptes connectés sont synchronisés dans Supabase.** Le navigateur reçoit l’énoncé ; la réponse attendue reste dans le schéma privé. La correction est effectuée par une Server Action qui vérifie le compte. Une tentative, correcte ou incorrecte, est enregistrée une seule fois ; les statistiques, badges et recommandations sont ensuite recalculés depuis la base.

Le visiteur voit une présentation du site et un exemple interactif, sans tableau de bord ni statistiques personnelles. Cet exemple ne sauvegarde pas de résultats. Les anciens résultats locaux ne sont pas importés dans le compte comme des réponses certifiées par le serveur. Les anciens résultats locaux d’un compte restent dans le stockage local mais ne sont pas ajoutés à sa progression distante.

La progression de chaque année atteint 100 % après cinq réussites dans chaque leçon : elle mesure l’entraînement, pas une certification de maîtrise. Les jours sont des journées distinctes, calculées selon Europe/Brussels pour les comptes connectés. Les statistiques sont récupérées à l’ouverture du tableau de bord, après chaque réponse, au retour sur l’onglet et avec le bouton « Actualiser ».

Le détail des notions, les repères pédagogiques et les limites de couverture sont dans [`docs/CONTENU.md`](docs/CONTENU.md). Cette première banque couvre les notions indiquées et ne constitue pas encore une couverture exhaustive du programme officiel de maths 6 h.

`content/curriculum.json` est la source commune du catalogue local et du SQL. Après modification du contenu, lancer `npm run sql:curriculum`, puis appliquer la migration générée. Les tests détectent un décalage entre JSON et SQL.

## Sécurité et vérifications

Les sessions utilisent les cookies gérés par `@supabase/ssr` et renouvelés dans `proxy.ts`. Les pages protégées et l’action de modification du profil vérifient l’utilisateur avec `auth.getUser()`. L’action ne reçoit aucun identifiant de compte du navigateur : elle utilise celui de la session vérifiée. Les lectures et les profils passent par la clé publique et les règles RLS. La génération et l’enregistrement évalué utilisent trois RPC réservées à `service_role`. Les résultats et abonnements ne sont pas modifiables directement par les élèves. Les RPC serveur refusent les mauvais propriétaires ; le verrouillage de l’instance garantit qu’une soumission concurrente ou rejouée ne compte qu’une fois. Une instance non soumise expire après une heure. La génération est limitée à 30 instances par minute et par compte.

La lecture des contenus publics, le lint, la compilation et les tests locaux sont vérifiables sans créer de compte. Le parcours réel d’inscription/confirmation nécessite un e-mail accessible. Vérifier avec deux comptes que chacun peut modifier son profil mais ne peut pas lire/modifier celui de l’autre avant l’ouverture publique.

## Migration 004 : formats d’exercices et autorisation parentale

**À appliquer avant de déployer cette version** : `supabase/migrations/004_formats_and_parental_consent.sql`, dans le SQL Editor, après 001 à 003. Elle est rejouable et ne supprime aucune donnée. Sans elle, l’espace élève refuse l’accès (le contrôle d’âge ne peut pas être vérifié) et les exercices QCM ou en expression sont refusés par la base.

1. Appliquer la migration.
2. Ajouter `RESEND_API_KEY` et `EMAIL_FROM` (voir `.env.example`) et vérifier `NEXT_PUBLIC_SITE_URL` : c’est l’adresse des liens envoyés aux parents. En développement sans clé, l’e-mail s’affiche dans le terminal de `npm run dev`.
3. Planifier `select private.purge_unconsented_minor_accounts();` chaque jour (pg_cron), ou le lancer régulièrement.
4. Les comptes existants n’ont pas de date de naissance : à leur prochaine connexion, `/bienvenue` la leur demande avant l’accès.

Détails et limites du parcours parental : [`docs/LEGAL.md`](docs/LEGAL.md).

## Activation des exercices connectés

1. Appliquer `supabase/migrations/003_connected_learning.sql` après les migrations précédentes. Elle est rejouable, sans suppression de données.
2. Renseigner `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local`, sans préfixe `NEXT_PUBLIC_`, puis redémarrer Next.js.
3. Se connecter, faire un exercice, actualiser le tableau de bord puis se reconnecter sur un autre navigateur : le résultat doit être retrouvé.

Le propriétaire a confirmé que l’inscription, la confirmation d’e-mail et la reconnexion fonctionnent. Les tests automatisés n’envoient aucun e-mail de confirmation.

## Tests

- `npm test` : 198 tests, dont une réponse de référence calculée à la main pour chacun des 126 modèles, des milliers de tirages aléatoires, la précision des réponses, l’absence de correction dans les énoncés envoyés, l’âge et les jetons d’autorisation.
- `npm run test:db` : nécessite PostgreSQL local (`initdb`, `pg_ctl`, `psql`). Crée un cluster temporaire avec socket Unix, applique les migrations (004 deux fois) et contrôle RLS, expiration, relecture, limitation de génération, agrégation, formats de réponse et parcours parental (blocage, limite d’envoi, expiration, accord, refus avec suppression, purge). Le serveur temporaire est arrêté après les tests ; aucune base distante n’est utilisée.
- `npm run test:supabase` : test d’intégration explicite sur le projet de `.env.local`. Crée deux comptes temporaires préconfirmés, teste connexion, profils, RLS, exercices, soumissions concurrentes et statistiques, puis supprime ces deux comptes et leurs données. Aucun e-mail n’est envoyé. Ne pas lancer ce test sans vouloir créer ces données temporaires.
- `npm run lint` et `npm run build -- --webpack` : vérifications du code et compilation.

## Prochaines étapes

1. Enrichir les recommandations et les bilans avec l’historique des erreurs ; ajouter des problèmes de synthèse et des séances de révision.
2. Tester et compléter les contenus avec des élèves et un professeur.
3. Ajouter Stripe Checkout, le portail client et le webhook signé. Dédupliquer les événements dans `private.stripe_events` et gérer les événements hors ordre.

Stripe n’est pas connecté et aucun abonnement n’est commercialisé. Ne pas exposer le schéma `private` via la Data API.

## Repères

- `components/landing.tsx` et `components/landing-demo.tsx` : accueil public et exemple interactif.
- `components/student/` : navigation partagée, progression, catalogue et exercices.
- `app/(eleve)/` : pages protégées `/dashboard`, `/cours`, `/cours/[slug]`, `/exercices`, `/progression` et `/badges`.
- `/` : présentation publique ; après connexion, arrivée sur `/dashboard` ou retour à la leçon demandée.
- Les onglets de leçon sont accessibles par URL (`?onglet=analogie` ou `?onglet=exercices`).
- `components/auth-form.tsx` et `components/profile-form.tsx` : comptes et profils.
- `lib/supabase/` et `proxy.ts` : clients et sessions Supabase.
- `app/compte/actions.ts` : modification validée du profil.
- `app/exercices/actions.ts` : génération, correction et progression connectées.
- `lib/connected-learning.ts` : contrats publics et validation des soumissions.
- `content/curriculum.json` : les 42 fiches pédagogiques.
- `lib/curriculum.ts` : classement par année, progression et fusion avec Supabase.
- `lib/learning.ts` : point d’entrée du moteur d’exercices. `lib/exercises/year-1.ts` à `year-6.ts` : les modèles par année ; `answers.ts` : lecture et correction des trois formats ; `build.ts` : outils pour écrire un modèle.
- `lib/age.ts`, `lib/parental-consent.ts`, `lib/mailer.ts`, `app/bienvenue/` et `app/autorisation-parentale/` : âge, autorisation parentale et envoi d’e-mail.
- `scripts/generate-curriculum-sql.mjs` : génération de la migration de contenu.
- `lib/progress-store.ts` : stockage du mode découverte local.
- `supabase/` : migration initiale et contenus.

### Vérification des pages

Avec l’application démarrée, `node --env-file=.env.local scripts/test-routes.mjs` vérifie les redirections des visiteurs et le rendu des pages connectées. Ce test crée un compte Supabase temporaire sans envoyer d’e-mail, puis le supprime. `TEST_APP_URL` permet de choisir un autre port local. Aucun nouveau script SQL n’est nécessaire pour cette réorganisation.

### Découvertes guidées des six années

Les 42 leçons s’ouvrent sur « Le déclic », puis « L’essentiel » et « Exercices infinis ». L’élève part d’une situation, essaie une réponse, peut demander des indices progressifs, puis relie son raisonnement aux symboles et répond à une nouvelle question. Certaines découvertes proposent aussi une illustration manipulable (fractions, déplacements, contour, suites) ou un quadrillage.

- `content/discoveries.json` contient les 41 parcours ajoutés : contexte, deux questions, réponses, erreurs fréquentes, indices et fiche de rappel.
- `components/student/guided-discovery.tsx` porte le parcours commun ; la leçon pilote sur les équations conserve son interface dédiée.
- Les découvertes sont publiques au sens de leur correction : leurs réponses sont présentes dans le contenu de la page. Leurs essais ne sont jamais comptés dans les résultats certifiés côté serveur.
- Les exercices enregistrés gardent leurs réponses côté serveur. Après une erreur, une observation ciblée quand elle est reconnue et une question conceptuelle précèdent la correction complète.
- Les nouveaux parcours sont livrés avec l’application et prennent la place des anciens onglets de texte. Supabase conserve le catalogue, les comptes et les résultats ; aucun nouveau SQL n’est nécessaire.

`tests/discovery.test.mjs` vérifie la couverture des 41 leçons, les réponses des 82 questions, les erreurs ciblées, les formats numériques et l’aide après correction. `scripts/test-routes.mjs` vérifie aussi le rendu connecté des nouveaux parcours.

### Pages légales et préparation de la publication

Les routes publiques `/mentions-legales`, `/conditions-utilisation`, `/confidentialite`, `/cookies`, `/contact` et `/accessibilite` sont liées depuis l’accueil, le compte et l’espace élève. Les textes décrivent le service gratuit réellement implémenté, sans inventer de conditions d’abonnement.

`content/legal-config.json` centralise les coordonnées et modalités à compléter. Le contact prévu est `contact@yakamaths.be` ; l’hébergeur prévu est Vercel. Les informations manquantes apparaissent comme telles. Tant que la configuration n’est pas complète et validée, les pages portent un bandeau « Version préparatoire » et une instruction `noindex`. Cela ne bloque pas techniquement les inscriptions ni le déploiement.

`npm run check:legal` liste les informations manquantes et retourne un code d’échec tant que les textes restent préparatoires. Les procédures concernant les mineurs, les durées de conservation, les demandes de droits et les prestataires doivent aussi être mises en place : voir [`docs/LEGAL.md`](docs/LEGAL.md). Aucun SQL n’est nécessaire pour ces pages.
