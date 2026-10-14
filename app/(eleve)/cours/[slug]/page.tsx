import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStudentData } from '@/lib/student-data';
import { lessonHref } from '@/lib/navigation';
import { discoveryLessons } from '@/lib/discovery';
import { EquationDiscovery, EquationTakeaway } from '@/components/student/equation-discovery';
import { GuidedDiscovery, DiscoveryTakeaway } from '@/components/student/guided-discovery';
import { ExerciseRunner } from '@/components/student/exercise-runner';

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ onglet?: string }>;
}) {
  const [{ slug }, query, data] = await Promise.all([params, searchParams, getStudentData()]);
  const topic = data.courses.find(course => course.slug === slug);
  if (!topic) notFound();
  const lesson = discoveryLessons[slug];
  const tab = query.onglet === 'analogie' ? 'analogie' : query.onglet === 'exercices' ? 'exercices' : 'theorie';

  return (
    <article className="lesson-page">
      <Link className="text-button" href="/cours">
        ← Tous les cours
      </Link>
      <div className="eyebrow">
        {topic.year}
        {topic.year === 1 ? 'RE' : 'E'} SECONDAIRE · {topic.chapter}
      </div>
      <h1>{topic.title}</h1>
      <p>
        {lesson?.title || 'Retrouver le nombre de départ'} · {topic.minutes} min
      </p>
      <nav className="lesson-tabs" aria-label="Contenu de la leçon">
        {[
          ['theorie', 'Le déclic'],
          ['analogie', 'L’essentiel'],
          ['exercices', 'Exercices', ' infinis'],
        ].map(([value, label, more]) => (
          <Link
            key={value}
            href={lessonHref(topic.slug, value)}
            className={tab === value ? 'selected' : ''}
            aria-current={tab === value ? 'page' : undefined}
          >
            {label}
            {more && <span className="label-long">{more}</span>}
          </Link>
        ))}
      </nav>
      <div className="lesson-content">
        {tab === 'exercices' ? (
          <ExerciseRunner key={slug} slug={slug} coach={lesson?.coach} />
        ) : slug === 'equation-additive' ? (
          tab === 'theorie' ? (
            <EquationDiscovery />
          ) : (
            <EquationTakeaway />
          )
        ) : lesson ? (
          tab === 'theorie' ? (
            <GuidedDiscovery key={slug} lesson={lesson} slug={slug} />
          ) : (
            <DiscoveryTakeaway lesson={lesson} slug={slug} />
          )
        ) : (
          <p>La découverte de cette leçon est en préparation.</p>
        )}
      </div>
    </article>
  );
}
