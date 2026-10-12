# Contenu pédagogique Yaka

## Périmètre

42 leçons originales, pour le secondaire général francophone belge. Les 1re à 4e années consolident les bases ; les 5e et 6e visent une première banque de notions pour l’orientation **maths 6 h**. La répartition par année est éditoriale et indicative : elle doit être validée selon le réseau, le programme de l’établissement et le déploiement du tronc commun. Aucun agrément ni couverture officielle exhaustive n’est revendiqué.

Chaque parcours commence par une situation à explorer, un essai avec retour ciblé et des indices progressifs. Le lien avec les symboles est dévoilé après une réussite ou à la demande ; une nouvelle question permet ensuite de réutiliser l’idée. L’onglet « L’essentiel » rassemble la règle, l’exemple et les limites de l’analogie. Chaque exercice attend un nombre, un choix parmi plusieurs réponses ou une expression développée en x. Les exercices ne remplacent pas les démonstrations, constructions ou problèmes de synthèse.

## Parcours disponibles

| Année | Leçons | Notions |
|---|---:|---|
| 1re | 6 | Les nombres relatifs, Les priorités opératoires, Les fractions équivalentes, Comprendre les pourcentages, Le périmètre du rectangle, Les angles d’un triangle |
| 2e | 6 | Additionner des fractions, Les premières équations, Les aires du rectangle, Multiplier des puissances, La proportionnalité, La moyenne arithmétique |
| 3e | 6 | Équations du premier degré, Développer et réduire, Le théorème de Pythagore, Lire une fonction affine, Le coefficient directeur, Effectifs et fréquences |
| 4e | 6 | Les racines d’un trinôme, Résoudre un système, Le sinus dans un triangle, Les figures semblables, Le sommet d’une parabole, Les probabilités simples |
| 5e | 9 | Les suites arithmétiques, Les suites géométriques, Des degrés aux radians, Le sinus sur le cercle, Le produit scalaire, Une limite après simplification, Les limites à l’infini, Dériver une puissance, L’équation d’une tangente |
| 6e | 9 | Les modèles exponentiels, Les logarithmes, Calculer une intégrale, Les probabilités conditionnelles, Dénombrer des choix, La loi binomiale, Centrer et réduire, Optimiser avec la dérivée, L’aire entre deux courbes |

## Exercices : trois modèles et trois formats par leçon

Chaque leçon propose **trois modèles d’exercices** (126 au total), tirés au hasard ; l’exercice suivant évite le modèle précédent. Les réponses prennent trois formes :

- **nombre** : entier, décimal (virgule ou point) ou fraction, avec l’arrondi indiqué quand il est demandé ;
- **QCM** : comparer des relatifs, simplifier une fraction, réciproque de Pythagore, sens de variation, nombre de solutions (Δ), maximum ou minimum, signes sur le cercle, limites selon les degrés, comparer des scores z ;
- **expression en x**, sous forme développée et réduite : développer (simple et double distributivité), équation d’une droite, fonction dérivée, équation d’une tangente, primitive. Les notations `3x² − 2x + 1`, `3x^2-2x+1`, `y = …` et `f′(x) = …` sont acceptées ; une forme non réduite (`6x + 10 + 5`) ou factorisée n’est pas comptée comme essai et l’élève est invité à la corriger.

Les modèles sont dans `lib/exercises/year-1.ts` à `year-6.ts`. Pour en ajouter un : écrire une entrée `{ id, build }` avec `numeric`, `choice` ou `polynomial` (voir `lib/exercises/build.ts`), puis ajouter sa réponse calculée à la main dans `tests/exercises.test.mjs` (le test échoue sinon). Le test vérifie aussi, sur des milliers de tirages, que la réponse attendue est acceptée, que chaque erreur-type est reconnue et n’est jamais une bonne réponse, et que les choix d’un QCM sont distincts.

## Progression et correction

- Les identifiants des trois anciennes leçons sont conservés. Les anciens compteurs locaux fractions/équations/aires sont repris dans leurs leçons de 2e.
- Une leçon atteint son objectif après cinq réponses correctes, cumulées. Cela mesure l’entraînement, pas une évaluation certificative. Changer d’année ne transfère pas ces réussites aux autres leçons.
- La dernière leçon ayant posé problème est recommandée si elle appartient à l’année sélectionnée. Sinon, la première leçon dont l’objectif reste à atteindre est proposée.
- Une réponse exacte sous forme de fraction est acceptée. Pour les exercices qui le demandent, le décimal correctement arrondi au millième est également accepté. Les pourcentages, coefficients de π et unités sont indiqués explicitement.
- La correction détecte certaines erreurs classiques. Une question conceptuelle aide à reprendre le raisonnement avant de dévoiler les étapes correspondant aux valeurs générées. Elle n’utilise pas de modèle IA.
- Les essais de découverte sont libres et non enregistrés. Seuls les exercices validés côté serveur contribuent aux compteurs.
- Les comptes connectés utilisent la validation et la progression serveur (migration 003). Le visiteur accède à une page de présentation et à un exemple interactif sans sauvegarde de résultats.

## Repères documentaires

Consultés le 25 septembre 2026 pour situer le parcours, sans reproduction des textes officiels :

- [WBE — Mathématiques, deuxième degré, 467/2015/240](https://www.wallonie-bruxelles-enseignement.be/progr/467-2015-240.pdf).
- [WBE — Mathématiques pour scientifiques, troisième degré, 470/2015/240](https://www.wallonie-bruxelles-enseignement.be/progr/470-2015-240.pdf).
- [Fédération Wallonie-Bruxelles — Le tronc commun dans le secondaire](https://pactepourunenseignementdexcellence.cfwb.be/mesures/le-tronc-commun-secondaire/).
- [SeGEC — Secteur mathématique](https://enseignement.catholique.be/secteur/secteur-mathematiques/), pour les évolutions du premier degré.

L’accès direct aux PDF WBE était limité lors de la consultation ; leurs extraits indexés ont servi de repères généraux. Une vérification détaillée des attendus, des prérequis et de leur placement annuel reste nécessaire avec un enseignant du réseau choisi.

## À compléter pour un parcours annuel complet

La banque actuelle propose des introductions ciblées, pas toutes les variantes de chaque chapitre. Il reste notamment à développer les inéquations, les démonstrations, la géométrie de l’espace, les équations trigonométriques générales, les dérivées composées, les intégrales plus générales, les probabilités binomiales pour tout k et les problèmes de synthèse combinant plusieurs notions. Les nouvelles questions de transfert restent des applications courtes. Les leçons de loi normale couvrent ici le centrage-réduction, pas le calcul complet des probabilités normales.

## Mettre à jour Supabase

Dans un projet ayant déjà reçu `001_initial_schema.sql` et `seed.sql`, exécuter uniquement `supabase/migrations/002_curriculum_all_years.sql`. Cette mise à jour conserve les IDs existants et remplace les textes du catalogue correspondant aux mêmes slugs. Elle ne modifie pas les données des élèves.

`content/curriculum.json` est la source du catalogue historique : `npm run sql:curriculum` régénère le SQL et `npm test` vérifie que les deux sont synchronisés. Pour une nouvelle base, appliquer 001, seed, puis 002.

## Modifier les découvertes guidées

`content/discoveries.json` contient les 41 parcours autres que la leçon pilote `equation-additive`, conservée dans `components/student/equation-discovery.tsx`. Les textes des onglets « Le déclic » et « L’essentiel » viennent de ces sources locales, pas des anciens champs `theory` et `analogy` de Supabase. Les titres et métadonnées du catalogue continuent de venir de Supabase avec un secours local. Aucun SQL supplémentaire n’est requis pour publier ces découvertes : il faut déployer l’application.

Pour modifier un exemple, vérifier ensemble le contexte, ses réponses, ses indices, son illustration éventuelle dans `discovery-visual.tsx` et les références mathématiques de `tests/discovery.test.mjs`. Une erreur proposée ne doit jamais être une réponse correcte. Les questions de transfert doivent distinguer la méthode attendue d’une erreur fréquente (par exemple calculer f′(a) au lieu de f(a)).
