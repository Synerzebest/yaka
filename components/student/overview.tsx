'use client';
import Link from 'next/link';
import { Icon } from '@/components/icons';
import { correctForLesson, yearDescriptions, yearProgress, type Topic } from '@/lib/curriculum';
import { lessonHref } from '@/lib/navigation';
import { useStudent } from './provider';
import { Plant } from './plant';

export function PageHeading({ title, description }: { title: string; description: string }) {
  const { profile, busy, changeYear, yearCourses } = useStudent();
  return (
    <>
      <section className="page-heading">
        <div>
          <div className="eyebrow">UN PETIT PAS CHAQUE JOUR</div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <label className="year-select">
          <span>Mon année</span>
          <div>
            <Icon name="book" size={17} />
            <select
              aria-label="Année scolaire"
              value={profile.school_year}
              disabled={busy}
              onChange={e => void changeYear(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>
                  {n}
                  {n === 1 ? 're' : 'e'} secondaire
                </option>
              ))}
            </select>
          </div>
        </label>
      </section>
      <div className="curriculum-summary">
        <span>{yearDescriptions[profile.school_year]}</span>
        <span>{yearCourses.length} leçons disponibles</span>
      </div>
    </>
  );
}
export function CourseList({ items, exercise = false }: { items: Topic[]; exercise?: boolean }) {
  const { progress } = useStudent();
  return (
    <div className="course-grid">
      {items.map(topic => {
        const count = correctForLesson(progress.topicCorrect, topic);
        return (
          <Link
            key={topic.slug}
            href={lessonHref(topic.slug, exercise ? 'exercices' : 'theorie')}
            className="course-card"
          >
            <div className="course-card-top">
              <span className={`topic-icon ${topic.color}`}>
                <Icon name={topic.icon} size={26} />
              </span>
              <span className="course-status">{count >= 5 ? 'Terminé ✓' : count ? 'En cours' : 'À découvrir'}</span>
            </div>
            <h3>{topic.title}</h3>
            <p>{topic.description}</p>
            <div className="course-meta">
              <span>
                {topic.minutes} min · {topic.chapter}
              </span>
              <span>{Math.min(5, count)}/5 réussites</span>
            </div>
            <div className="progress-track">
              <i style={{ width: `${Math.min(100, count * 20)}%` }} />
            </div>
            <div className="course-bottom">
              <span>{exercise ? 'Je m’entraîne' : count ? 'Continuer la leçon' : 'Découvrir la leçon'}</span>
              <Icon name="arrow" size={16} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
export function Statistics() {
  const { progress, profile, courses } = useStudent();
  const items = [
    [
      'Ta progression',
      `${yearProgress(progress.topicCorrect, courses, profile.school_year)} %`,
      'Dans l’année sélectionnée',
    ],
    ['Exercices réussis', String(progress.correct), 'Toutes années confondues'],
    [
      'Taux de réussite',
      `${progress.attempts ? Math.round((progress.correct / progress.attempts) * 100) : 0} %`,
      `${progress.attempts} essais enregistrés`,
    ],
    ['Jours d’apprentissage', String(progress.days.length), 'Chaque petit pas compte'],
  ];
  return (
    <section className="stats-grid" aria-label="Mes statistiques">
      {items.map(([title, value, note]) => (
        <div className="stat-card" key={title}>
          <div className="stat-top">{title}</div>
          <div className="stat-value">{value}</div>
          <p>{note}</p>
        </div>
      ))}
    </section>
  );
}
export function Recommendation() {
  const { recommended, progress, profile } = useStudent();
  return (
    <aside className="right-column">
      <section className="recommendation">
        <div className="recommendation-label">
          <Icon name="sparkles" size={17} /> JUSTE POUR TOI
        </div>
        <h2>{progress.lastMistake === recommended.slug ? 'Un petit coup de pouce ?' : 'Ton prochain déclic'}</h2>
        <p>
          {progress.lastMistake === recommended.slug
            ? `Reprenons « ${recommended.title} » avec un nouvel essai.`
            : recommended.description}
        </p>
        <h3>{recommended.title}</h3>
        <Link className="outline-button" href={lessonHref(recommended.slug, 'exercices')}>
          Je relève le défi <Icon name="arrow" size={16} />
        </Link>
      </section>
      <section className="weekly-goal">
        <h3>Ton petit objectif</h3>
        <p>
          {Math.min(progress.correct, profile.exercise_goal)} / {profile.exercise_goal} exercices réussis
        </p>
        <div className="progress-track">
          <i style={{ width: `${Math.min(100, (progress.correct / profile.exercise_goal) * 100)}%` }} />
        </div>
        <Link className="text-button" href="/compte">
          Modifier mon objectif
        </Link>
      </section>
    </aside>
  );
}
export function Journey() {
  const { progress, yearCourses, recommended } = useStudent();
  const count = yearCourses.reduce((sum, topic) => sum + correctForLesson(progress.topicCorrect, topic), 0);
  return (
    <section className="journey-card">
      <div className="section-heading">
        <div>
          <h2>Ton chemin vers le déclic</h2>
          <p>Les réussites de l’année sélectionnée.</p>
        </div>
      </div>
      <div className="journey">
        <div className="journey-line" />
        {[
          ['Le premier pas', 0],
          ['Le déclic', 1],
          ['L’élan', 5],
          ['La confiance', 15],
        ].map(([name, limit]) => (
          <Link
            href={lessonHref(recommended.slug, 'exercices')}
            className={`journey-step ${count >= Number(limit) ? 'done' : ''}`}
            key={name}
          >
            <span className="journey-node">
              <Icon name={count >= Number(limit) ? 'check' : 'lock'} size={22} />
            </span>
            <strong>{name}</strong>
            <small>{limit === 0 ? 'Bienvenue chez toi' : `${limit} réussites`}</small>
          </Link>
        ))}
      </div>
    </section>
  );
}
export function DashboardPage() {
  const { profile, yearCourses, recommended } = useStudent();
  return (
    <>
      <PageHeading
        title={`Salut ${profile.display_name} ✺`}
        description="Prêt à faire des maths un peu plus simplement ?"
      />
      <section className="hero">
        <div className="hero-copy">
          <div className="pill">LES MATHS, ÇA S’APPREND.</div>
          <h2>
            Pas besoin d’être un génie.
            <br />
            Juste d’avoir le bon déclic.
          </h2>
          <p>Des explications qui parlent, des exercices à l’infini.</p>
          <Link className="primary-button" href={lessonHref(recommended.slug, 'exercices')}>
            C’est parti, je m’entraîne <Icon name="arrow" size={17} />
          </Link>
        </div>
        <Plant />
      </section>
      <Statistics />
      <div className="content-grid">
        <div className="content-primary">
          <section className="courses-section">
            <div className="section-heading">
              <h2>Un chapitre, un nouveau déclic</h2>
              <Link className="text-button" href="/cours">
                Tous les cours →
              </Link>
            </div>
            <CourseList items={yearCourses.slice(0, 3)} />
          </section>
          <Journey />
        </div>
        <Recommendation />
      </div>
    </>
  );
}
export function CoursesPage({ exercise = false }: { exercise?: boolean }) {
  const { yearCourses } = useStudent();
  return (
    <>
      <PageHeading
        title={exercise ? 'Exercices' : 'Mes cours'}
        description={
          exercise
            ? 'Des exercices qui changent à chaque essai.'
            : 'Comprends à ton rythme, avec des exemples et des analogies.'
        }
      />
      <CourseList items={yearCourses} exercise={exercise} />
    </>
  );
}
export function ProgressPage() {
  const { yearCourses } = useStudent();
  return (
    <>
      <PageHeading title="Ma progression" description="Chaque erreur est une occasion de comprendre." />
      <Statistics />
      <Journey />
      <section className="courses-section">
        <div className="section-heading">
          <h2>Ta progression par leçon</h2>
        </div>
        <CourseList items={yearCourses} />
      </section>
    </>
  );
}
export function BadgesPage() {
  const { progress } = useStudent();
  return (
    <>
      <PageHeading title="Mes badges" description="Tes petites victoires, toutes années confondues." />
      <section className="badges-grid">
        {[
          { icon: 'leaf', name: 'Le premier pas', limit: 0 },
          { icon: 'bolt', name: 'Premier déclic', limit: 1 },
          { icon: 'flame', name: 'Sur ta lancée', limit: 5 },
          { icon: 'award', name: 'La confiance', limit: 15 },
        ].map(b => (
          <div key={b.name} className={`badge-card ${progress.correct >= b.limit ? 'earned' : ''}`}>
            <Icon name={b.icon} size={40} />
            <h3>{b.name}</h3>
            <p>{progress.correct >= b.limit ? 'Badge débloqué !' : `${b.limit} exercices réussis pour le débloquer`}</p>
          </div>
        ))}
      </section>
    </>
  );
}
