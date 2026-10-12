import curriculum from '../content/curriculum.json' with { type: 'json' };
import type { ExerciseKind } from './learning';

export type Topic = {
  slug: string;
  year: number;
  chapter: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  kind: ExerciseKind;
  theory: string;
  analogy: string;
  analogyTitle: string;
  emoji: string;
  pitfall: string;
  method: string[];
  example: string;
  minutes: number;
  position: number;
};
export const topics = curriculum as Topic[];
export const yearDescriptions: Record<number, string> = {
  1: 'Les bases : nombres, proportions et premières figures.',
  2: 'Consolider le calcul, les équations et les mesures.',
  3: 'Relier l’algèbre, les fonctions et la géométrie.',
  4: 'Explorer le second degré et raisonner avec des modèles.',
  5: 'Maths 6 h : suites, trigonométrie, vecteurs et dérivées.',
  6: 'Maths 6 h : analyse, intégrales et probabilités avancées.',
};
export function topicsForYear(catalog: Topic[], year: number) {
  return catalog.filter(topic => topic.year === year).sort((a, b) => a.position - b.position);
}
const legacyKeys: Record<string, string> = {
  'fractions-meme-denominateur': 'fractions',
  'equation-additive': 'equations',
  'aire-rectangle': 'geometry',
};
export function correctForLesson(counts: Record<string, number>, topic: Topic) {
  return counts[topic.slug] ?? counts[legacyKeys[topic.slug]] ?? 0;
}
export function yearProgress(counts: Record<string, number>, catalog: Topic[], year: number) {
  const lessons = topicsForYear(catalog, year);
  return lessons.length
    ? Math.round(
        (100 * lessons.reduce((sum, topic) => sum + Math.min(5, correctForLesson(counts, topic)), 0)) /
          (lessons.length * 5),
      )
    : 0;
}
export function recommendLesson(lessons: Topic[], counts: Record<string, number>, lastMistake?: string) {
  const difficult = lessons.find(topic => topic.slug === lastMistake);
  return difficult || lessons.find(topic => correctForLesson(counts, topic) < 5) || lessons[0];
}

type PublishedLesson = {
  slug: string;
  title?: string;
  theory?: string;
  analogy?: string;
  common_mistake?: string;
  metadata?: unknown;
};
// New local lessons remain available before the SQL content update has been run.
export function mergeCurriculum(published: PublishedLesson[]) {
  return topics.map(topic => {
    const row = published.find(lesson => lesson.slug === topic.slug);
    if (!row) return topic;
    const metadata = row.metadata && typeof row.metadata === 'object' ? (row.metadata as Record<string, unknown>) : {};
    const text = (value: unknown, fallback: string) => (typeof value === 'string' && value.trim() ? value : fallback);
    return {
      ...topic,
      title: text(row.title, topic.title),
      theory: text(row.theory, topic.theory),
      analogy: text(row.analogy, topic.analogy),
      pitfall: text(row.common_mistake, topic.pitfall),
      description: text(metadata.description, topic.description),
      example: text(metadata.example, topic.example),
      analogyTitle: text(metadata.analogyTitle, topic.analogyTitle),
      emoji: text(metadata.emoji, topic.emoji),
      method:
        Array.isArray(metadata.method) &&
        metadata.method.length &&
        metadata.method.every(step => typeof step === 'string' && step.trim())
          ? (metadata.method as string[])
          : topic.method,
      minutes:
        typeof metadata.minutes === 'number' && metadata.minutes > 0 && metadata.minutes < 120
          ? metadata.minutes
          : topic.minutes,
    };
  });
}
