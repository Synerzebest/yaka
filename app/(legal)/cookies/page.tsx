import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalDocument } from '@/components/legal-document';

export const metadata: Metadata = { title: 'Cookies et stockage local — Yaka' };
export default function Page() {
  return (
    <LegalDocument
      title="Cookies et stockage local"
      intro="Ce que ton navigateur conserve pour permettre la connexion, et comment le supprimer."
    >
      <section>
        <h2>1. Ce qui est utilisé aujourd’hui</h2>
        <p>
          Le code actuel utilise les cookies nécessaires à la connexion Supabase et à la continuité de la session. Il ne
          charge pas de traceur publicitaire, de mesure d’audience ni de lecteur tiers. Les polices sont servies avec
          l’application, sans requête du navigateur vers Google Fonts.
        </p>
        <p>
          Les cookies strictement nécessaires au service demandé ne nécessitent pas de consentement préalable. Leur
          utilisation doit néanmoins être expliquée et leur durée adaptée à leur finalité. Une vérification du site
          déployé reste nécessaire pour identifier d’éventuels cookies ajoutés par l’hébergeur.
        </p>
      </section>
      <section>
        <h2>2. Inventaire technique actuel</h2>
        <div className="legal-table-wrap" tabIndex={0} role="region" aria-label="Inventaire des cookies">
          <table>
            <caption>Configuration observée dans les bibliothèques installées</caption>
            <thead>
              <tr>
                <th>Nom ou famille</th>
                <th>Rôle</th>
                <th>Durée configurée</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>sb-…-auth-token</code>, éventuellement découpé en plusieurs cookies numérotés.
                </td>
                <td>Conserver les éléments de session pour rester connecté à ton compte.</td>
                <td>
                  La bibliothèque installée utilise une durée de cookie de 400 jours, renouvelable lors des écritures de
                  session. Cela ne correspond pas à la durée de validité d’un jeton d’accès. Les cookies de session sont
                  retirés lors de la déconnexion dans ce navigateur.
                </td>
              </tr>
              <tr>
                <td>
                  Famille <code>sb-…-code-verifier</code>, dont les variantes liées à un flux.
                </td>
                <td>Sécuriser l’échange de code lors d’une confirmation d’e-mail ou d’une récupération de compte.</td>
                <td>
                  Retrait lors de la consommation du flux lorsque celui-ci aboutit ; en cas de flux abandonné, les
                  cookies peuvent garder la durée par défaut de 400 jours. Cette configuration doit être revue avant
                  l’ouverture publique pour limiter leur durée au besoin réel.
                </td>
              </tr>
              <tr>
                <td>
                  <code>yaka-progress-v1</code> et anciennes variantes par compte, dans le stockage local.
                </td>
                <td>
                  Restes éventuels d’une ancienne version de découverte. Les pages actuelles ne les lisent plus et n’y
                  enregistrent plus de résultats.
                </td>
                <td>
                  Pas d’expiration automatique du stockage local ; suppression possible via les données du site dans le
                  navigateur.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Les noms exacts varient selon le projet Supabase et la taille de la session. Les cookies d’authentification
          sont déposés sur le domaine du site. Les échanges nécessaires à l’authentification sont effectués avec
          Supabase. Les durées ci-dessus décrivent le code actuel, pas un engagement de conservation des données côté
          serveur.
        </p>
      </section>
      <section>
        <h2>3. Tes choix</h2>
        <p>
          Sur un ordinateur partagé, utilise « Me déconnecter » avant de partir. Tu peux aussi supprimer les cookies et
          données de Yaka dans les paramètres de ton navigateur. Bloquer les cookies nécessaires peut empêcher la
          connexion ou la confirmation de ton adresse.
        </p>
        <p>
          Effacer les données du navigateur ne supprime pas ton compte ni les résultats enregistrés dans Supabase. Pour
          cela, utilise le <Link href="/contact#donnees">contact relatif aux données personnelles</Link>.
        </p>
        <p>
          Aucun bouton « Tout accepter » n’est affiché pour de prétendus cookies facultatifs inexistants. Si de tels
          outils sont ajoutés, ils devront être bloqués jusqu’au choix requis, avec un refus aussi accessible que
          l’acceptation et un moyen de revenir sur ce choix.
        </p>
      </section>
      <section>
        <h2>4. En savoir plus</h2>
        <p>
          Consulte la <Link href="/confidentialite">politique de confidentialité</Link> pour les données de ton compte
          et l’
          <a href="https://www.autoriteprotectiondonnees.be/citoyen/themes/internet/cookies">
            information officielle de l’APD sur les cookies
          </a>
          .
        </p>
      </section>
    </LegalDocument>
  );
}
