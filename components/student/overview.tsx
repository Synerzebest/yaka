'use client';
import Link from 'next/link';
import { Icon } from '@/components/icons';
import { correctForLesson, yearDescriptions, yearProgress, type Topic } from '@/lib/curriculum';
import { lessonHref } from '@/lib/navigation';
import { CountUp, FloatingSymbols } from '@/components/fun';
import { Mascot } from '@/components/mascot';
import { Select, schoolYearOptions } from '@/components/select';
import { useStudent } from './provider';

export function PageHeading({
  title,
  description,
  wave = false,
}: {
  title: string;
  description: string;
  wave?: boolean;
}) {
  const { profile, busy, changeYear, yearCourses } = useStudent();
  return (
    <>
      <section className="page-heading">
        <div>
          <div className="eyebrow">Un petit pas chaque jour</div>
          <h1>
            {title}
            {wave && (
              <>
                {' '}
                <span className="wave-hand" aria-hidden="true">
                  👋
                </span>
              </>
            )}
          </h1>
          <p>{description}</p>
        </div>
        <div className="year-select">
          <span id="year-select-label">Mon année</span>
          <Select
            labelledBy="year-select-label"
            options={schoolYearOptions}
            value={String(profile.school_year)}
            disabled={busy}
            icon={<Icon name="book" size={17} />}
            onChange={value => void changeYear(Number(value))}
          />
        </div>
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
              <span className={`course-status ${count >= 5 ? 'finished' : count ? 'started' : ''}`}>
                {count >= 5 ? 'Maîtrisé ✓' : count ? 'En cours' : 'Nouveau'}
              </span>
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
  const items: [string, number, string, string][] = [
    ['Ta progression', yearProgress(progress.topicCorrect, courses, profile.school_year), ' %', 'Sur ton année'],
    ['Exercices réussis', progress.correct, '', 'Depuis le début'],
    [
      'Taux de réussite',
      progress.attempts ? Math.round((progress.correct / progress.attempts) * 100) : 0,
      ' %',
      `Sur ${progress.attempts} essai${progress.attempts > 1 ? 's' : ''}`,
    ],
    ['Jours de maths', progress.days.length, '', 'Chaque jour compte'],
  ];
  return (
    <section className="stats-grid" aria-label="Mes statistiques">
      {items.map(([title, value, suffix, note]) => (
        <div className="stat-card" key={title}>
          <div className="stat-top">{title}</div>
          <div className="stat-value">
            <CountUp value={value} suffix={suffix} />
          </div>
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
        <h2>{progress.lastMistake === recommended.slug ? 'On retente le coup ?' : 'Ton prochain déclic'}</h2>
        <p>
          {progress.lastMistake === recommended.slug
            ? `« ${recommended.title} » t’a résisté la dernière fois. Cette fois, c’est la bonne !`
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
          {progress.correct >= profile.exercise_goal && (
            <span className="goal-done" aria-hidden="true">
              🎉
            </span>
          )}
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
          <p>Chaque exercice réussi te fait avancer.</p>
        </div>
      </div>
      <div className="journey">
        <div className="journey-line" />
        {[
          ['Le premier pas', 0],
          ['Le déclic', 1],
          ['L’élan', 5],
          ['La confiance', 15],
        ].map(([name, limit], index, steps) => (
          <Link
            href={lessonHref(recommended.slug, 'exercices')}
            className={`journey-step ${
              count >= Number(limit) ? 'done' : index > 0 && count >= Number(steps[index - 1][1]) ? 'next' : ''
            }`}
            key={name}
          >
            <span className="journey-node">
              <Icon name={count >= Number(limit) ? 'check' : 'lock'} size={22} />
            </span>
            <strong>{name}</strong>
            <small>
              {limit === 0 ? 'Tu es là, c’est déjà ça !' : `${limit} réussite${Number(limit) > 1 ? 's' : ''}`}
            </small>
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
        title={`Salut ${profile.display_name} !`}
        description="On fait un peu de maths ? Promis, ça va bien se passer."
        wave
      />
      <section className="hero">
        <FloatingSymbols count={9} />
        <div className="hero-copy">
          <div className="pill">LES MATHS, ÇA S’APPREND</div>
          <h2>
            Pas besoin d’être un génie.
            <br />
            Juste d’avoir le bon déclic.
          </h2>
          <p>Des explications simples, des exercices à l’infini.</p>
          <Link className="primary-button" href={lessonHref(recommended.slug, 'exercices')}>
            C’est parti ! <Icon name="arrow" size={18} />
          </Link>
        </div>
        <span className="hero-bubble">Je t’ai gardé un exercice 😉</span>
        <div className="hero-mascot">
          <Mascot size={150} />
        </div>
      </section>
      <Statistics />
      <div className="content-grid">
        <div className="content-primary">
          <section className="courses-section">
            <div className="section-heading">
              <h2>Tes leçons du moment</h2>
              <Link className="text-button" href="/cours">
                Tout voir <Icon name="arrow" size={16} />
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
            ? 'Des exercices qui changent à chaque fois. Impossible de les apprendre par cœur !'
            : 'Choisis une leçon et laisse-toi guider, à ton rythme.'
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
      <PageHeading title="Ma progression" description="Chaque erreur t’apprend quelque chose. Si si, vraiment." />
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
      <PageHeading title="Mes badges" description="Ta collection de petites victoires." />
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
            <p>
              {progress.correct >= b.limit
                ? 'Débloqué ! 🎉'
                : `Encore ${b.limit - progress.correct} exercice${b.limit - progress.correct > 1 ? 's' : ''} réussi${b.limit - progress.correct > 1 ? 's' : ''}`}
            </p>
          </div>
        ))}
      </section>
    </>
  );
}
