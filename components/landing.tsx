import { LegalLinks } from '@/components/legal-links';
import Link from 'next/link';
import { Icon } from './icons';
import { FloatingSymbols } from './fun';
import { LandingDemo } from './landing-demo';
import { Mascot } from './mascot';
import { BrandStar, Sparkle } from './brand-star';

const years = [
  { year: '1re', text: 'Des bases solides', detail: 'Nombres relatifs, fractions, angles' },
  { year: '2e', text: 'Prendre confiance', detail: 'Équations, aires, proportions' },
  { year: '3e', text: 'Tout relier', detail: 'Calcul littéral, fonctions, Pythagore' },
  { year: '4e', text: 'Passer la vitesse supérieure', detail: 'Second degré, trigo, probabilités' },
  { year: '5e', text: 'Entrer dans les maths 6 h', detail: 'Suites, vecteurs, dérivées' },
  { year: '6e', text: 'Finir en beauté', detail: 'Intégrales, logarithmes, probabilités' },
];
export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-header">
        <Link className="landing-logo" href="/" aria-label="Yaka, accueil">
          yaka<span>.</span>
          <span className="landing-logo-flower" aria-hidden="true">
            <BrandStar />
          </span>
        </Link>
        <nav aria-label="Navigation du site">
          <a href="#la-methode">La méthode</a>
          <a href="#les-parcours">Les parcours</a>
        </nav>
        <div className="landing-account">
          <Link href="/connexion">
            <span className="label-long">Se connecter</span>
            <span className="label-short">Connexion</span>
          </Link>
          <Link href="/connexion?mode=inscription" className="primary-button">
            <span className="label-long">Créer mon compte</span>
            <span className="label-short">S’inscrire</span>
            <Icon name="arrow" size={16} />
          </Link>
        </div>
      </header>
      <main className="landing-main">
        <section className="landing-hero">
          <FloatingSymbols count={12} />
          <div className="landing-hero-copy">
            <div className="landing-eyebrow">
              <span /> SECONDAIRE BELGE · DE LA 1RE À LA 6E
            </div>
            <h1>
              Les maths ne sont pas <br />
              une question de don. <br />
              {/* Kept together so the asterisk never wraps alone onto a new line. */}
              <span className="hero-last">
                <em>Juste de déclic.</em>
                <span className="hero-asterisk" aria-hidden="true">
                  <BrandStar />
                </span>
              </span>
            </h1>
            <p>
              Des explications avec des mots simples, des exemples de tous les jours, et ce moment génial où tu te dis :{' '}
              <strong>« Ah, mais c’est tout ? »</strong>
            </p>
            <p className="landing-hero-description">
              Yaka t’explique les maths comme le ferait un ami patient, puis te laisse t’entraîner autant que tu veux.
              Tu te trompes ? Pas grave : on regarde ensemble pourquoi.
            </p>
            <div className="landing-hero-actions">
              <Link className="primary-button" href="/connexion?mode=inscription">
                Je commence, c’est gratuit <Icon name="arrow" size={18} />
              </Link>
              <a href="#un-premier-declic">
                Tester tout de suite <Icon name="chevron" size={15} />
              </a>
            </div>
            <div className="landing-reassurance">
              <Icon name="check" size={15} /> Gratuit, sans pub, de la 1re à la 6e secondaire.
            </div>
          </div>
          <div className="landing-hero-visual">
            <div className="floating-note">Essaie, ici, sans compte 👇</div>
            <LandingDemo />
            <Mascot size={110} />
            <span className="visual-orbit" aria-hidden="true">
              <Sparkle />
            </span>
          </div>
        </section>
        <div className="landing-facts">
          <span>
            <Icon name="book" />
            42 leçons, 126 types d’exercices
          </span>
          <span>
            <Icon name="infinity" />
            Des exercices qui ne finissent jamais
          </span>
          <span>
            <Icon name="leaf" />À ton rythme, sans stress
          </span>
        </div>
        <section className="landing-method reveal" id="la-methode">
          <div className="landing-section-title">
            <span className="landing-eyebrow">LA MÉTHODE YAKA</span>
            <h2>Comprendre d’abord. Retenir ensuite.</h2>
            <p>
              Pas de pages de théorie à apprendre par cœur.
              <br />
              On part d’une situation concrète, et la règle arrive toute seule.
            </p>
          </div>
          <div className="method-grid">
            {[
              {
                number: '01',
                icon: 'book',
                color: 'purple',
                title: 'D’abord, tu explores.',
                text: 'Un gâteau à partager, un trajet à raccourcir, une balance à équilibrer… Tu cherches la réponse avec ta tête, avant toute formule.',
              },
              {
                number: '02',
                icon: 'sparkles',
                color: 'peach',
                title: 'Puis, le déclic.',
                text: 'Une fois que tu as compris l’idée, on te montre comment l’écrire en maths. Et là, la règle devient évidente.',
              },
              {
                number: '03',
                icon: 'infinity',
                color: 'green',
                title: 'Enfin, tu t’entraînes.',
                text: 'Des exercices qui changent à chaque fois. Si tu te trompes, Yaka repère ton erreur et t’aide à la comprendre.',
              },
            ].map(step => (
              <article className="method-card" key={step.number}>
                <div>
                  <span className={`topic-icon ${step.color}`}>
                    <Icon name={step.icon} size={25} />
                  </span>
                  <span className="method-number">{step.number}</span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="landing-curriculum reveal" id="les-parcours">
          <div className="landing-section-title">
            <span className="landing-eyebrow">TON ANNÉE, TES LEÇONS</span>
            <h2>Tu commences où tu veux.</h2>
            <p>
              Choisis ton année et retrouve les notions du moment.
              <br />
              En 5e et 6e, les parcours suivent les maths 6 h.
            </p>
          </div>
          <div className="landing-year-grid">
            {years.map(item => (
              <Link className="landing-year" key={item.year} href="/connexion?mode=inscription">
                <span className="landing-year-number">
                  {item.year}
                  <small>secondaire</small>
                </span>
                <h3>{item.text}</h3>
                <p>{item.detail}</p>
                <Icon name="arrow" size={18} />
              </Link>
            ))}
          </div>
          <p className="curriculum-footnote">
            Une première banque de notions pour le général francophone, à compléter selon le programme de ton école.
          </p>
        </section>
        <section className="landing-bottom-cta reveal">
          <FloatingSymbols count={8} />
          <div>
            <span className="landing-eyebrow">
              <span /> PRÊT·E ?
            </span>
            <h2>
              Ton prochain « j’ai compris »
              <br />
              est à deux clics.
            </h2>
            <p>Crée ton compte : tes progrès te suivent sur ton téléphone, ta tablette et ton ordi.</p>
          </div>
          <Link className="primary-button" href="/connexion?mode=inscription">
            C’est parti ! <Icon name="arrow" size={18} />
          </Link>
          <span aria-hidden="true" className="cta-flower">
            <BrandStar />
          </span>
        </section>
      </main>
      <footer className="landing-footer">
        <Link href="/" className="landing-logo">
          yaka<span>.</span>
        </Link>
        <span>Les maths, à ta façon.</span>
        <Link href="/connexion">
          Retrouver mon espace <Icon name="arrow" size={14} />
        </Link>
        <LegalLinks />
      </footer>
    </div>
  );
}
