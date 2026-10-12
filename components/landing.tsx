import { LegalLinks } from '@/components/legal-links';
import Link from 'next/link';
import { Icon } from './icons';
import { LandingDemo } from './landing-demo';

const years = [
  { year: '1re', text: 'Prendre de bonnes bases', detail: 'Nombres, fractions et figures' },
  { year: '2e', text: 'Gagner en confiance', detail: 'Équations, aires et proportions' },
  { year: '3e', text: 'Relier les idées', detail: 'Algèbre, fonctions et Pythagore' },
  { year: '4e', text: 'Aller un peu plus loin', detail: 'Second degré et trigonométrie' },
  { year: '5e', text: 'Construire son raisonnement', detail: 'Suites, vecteurs et dérivées' },
  { year: '6e', text: 'Préparer la suite', detail: 'Analyse, intégrales et probabilités' },
];
export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-header">
        <Link className="landing-logo" href="/" aria-label="Yaka, accueil">
          yaka<span>.</span>
          <span className="landing-logo-flower" aria-hidden="true">
            ✳
          </span>
        </Link>
        <nav aria-label="Navigation du site">
          <a href="#la-methode">La méthode</a>
          <a href="#les-parcours">Les parcours</a>
        </nav>
        <div className="landing-account">
          <Link href="/connexion">Se connecter</Link>
          <Link href="/connexion?mode=inscription" className="primary-button">
            Créer mon compte <Icon name="arrow" size={16} />
          </Link>
        </div>
      </header>
      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <div className="landing-eyebrow">
              <span /> POUR LE SECONDAIRE BELGE, DE LA 1RE À LA 6E
            </div>
            <h1>
              Les maths ne sont pas
              <br />
              une question de don.
              <br />
              <em>Juste de déclic.</em>
              <span className="hero-asterisk" aria-hidden="true">
                ✳
              </span>
            </h1>
            <p>
              Une explication qui te parle. Une image qui reste.
              <br />
              Et ce moment où tu te dis : <strong>« Ah, j’ai compris ! »</strong>
            </p>
            <p className="landing-hero-description">
              Yaka t’aide à comprendre les maths et à t’entraîner à ton rythme, avec des analogies concrètes et des
              corrections qui t’accompagnent.
            </p>
            <div className="landing-hero-actions">
              <Link className="primary-button" href="/connexion?mode=inscription">
                Trouver mon premier déclic <Icon name="arrow" size={18} />
              </Link>
              <a href="#un-premier-declic">
                Essayer un exemple <Icon name="chevron" size={15} />
              </a>
            </div>
            <div className="landing-reassurance">
              <Icon name="check" size={15} /> Les cours disponibles sont accessibles gratuitement.
            </div>
          </div>
          <div className="landing-hero-visual">
            <div className="floating-note">
              Moins de « par cœur »,
              <br />
              plus de « j’ai compris ».
            </div>
            <LandingDemo />
            <span className="visual-orbit" aria-hidden="true">
              ✧
            </span>
          </div>
        </section>
        <div className="landing-facts">
          <span>
            <Icon name="book" />
            42 leçons pour commencer
          </span>
          <span>
            <Icon name="infinity" />
            Des exercices qui se renouvellent
          </span>
          <span>
            <Icon name="leaf" />
            Chacun son rythme
          </span>
        </div>
        <section className="landing-method" id="la-methode">
          <div className="landing-section-title">
            <span className="landing-eyebrow">LA MÉTHODE YAKA</span>
            <h2>Comprendre avant de retenir.</h2>
            <p>
              Pas de longues pages à apprendre sans savoir pourquoi.
              <br />
              Un chemin simple pour que les idées prennent du sens.
            </p>
          </div>
          <div className="method-grid">
            {[
              {
                number: '01',
                icon: 'book',
                color: 'purple',
                title: 'L’essentiel, clairement.',
                text: 'Une théorie courte, une méthode pas à pas et un exemple résolu. Tu sais ce qui compte et par où commencer.',
              },
              {
                number: '02',
                icon: 'sparkles',
                color: 'peach',
                title: 'Une image qui fait tilt.',
                text: 'Une pizza pour les fractions, une balance pour les équations. On part du concret pour éclairer ce qui semblait abstrait.',
              },
              {
                number: '03',
                icon: 'infinity',
                color: 'green',
                title: 'Essaie. Comprends. Recommence.',
                text: 'Des exercices renouvelés et une correction guidée. Tu identifies les pièges classiques et tu avances, un essai à la fois.',
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
        <section className="landing-curriculum" id="les-parcours">
          <div className="landing-section-title">
            <span className="landing-eyebrow">À CHAQUE ANNÉE, SES DÉCLICS</span>
            <h2>Un point de départ, où que tu en sois.</h2>
            <p>
              Choisis ton année et retrouve les notions à travailler.
              <br />
              Les parcours de 5e et 6e s’orientent vers les maths 6 h.
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
        <section className="landing-bottom-cta">
          <div>
            <span className="landing-eyebrow">UN PETIT PAS AUJOURD’HUI</span>
            <h2>
              Ton prochain « j’ai compris »<br />
              commence ici.
            </h2>
            <p>
              Crée ton compte pour retrouver tes cours et garder tes progrès,
              <br />
              même quand tu changes d’appareil.
            </p>
          </div>
          <Link className="primary-button" href="/connexion?mode=inscription">
            C’est parti, je crée mon compte <Icon name="arrow" size={18} />
          </Link>
          <span aria-hidden="true" className="cta-flower">
            ✳
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
