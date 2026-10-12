import { readFileSync, writeFileSync } from 'node:fs';

const curriculum = JSON.parse(readFileSync(new URL('../content/curriculum.json', import.meta.url), 'utf8'));
const quote = value => `'${String(value).replaceAll("'", "''")}'`;
const chapterSlugs = {
  'Nombres & calculs': 'nombres',
  Algèbre: 'algebre',
  Géométrie: 'geometrie',
  Fonctions: 'fonctions',
  'Statistiques & probabilités': 'statistiques',
  Suites: 'suites',
  Analyse: 'analyse',
  Trigonométrie: 'trigonometrie',
};
const chapters = new Map();
for (const lesson of curriculum) {
  if (!chapterSlugs[lesson.chapter]) throw new Error(`Unknown chapter ${lesson.chapter}`);
  const slug = `${lesson.year}-${chapterSlugs[lesson.chapter]}`;
  if (!chapters.has(slug))
    chapters.set(slug, { slug, title: lesson.chapter, year: lesson.year, position: lesson.position });
}
let sql = `-- Yaka : 42 leçons, secondaire général francophone, orientation maths 6 h au 3e degré.
-- Généré depuis content/curriculum.json : npm run sql:curriculum
-- À exécuter APRÈS 001_initial_schema.sql et seed.sql. Rejouable.
-- Les identifiants des leçons existantes sont conservés, ainsi que les profils et tentatives.
begin;

alter table public.lessons add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.lessons drop constraint if exists lessons_exercise_kind_check;
alter table public.lessons add constraint lessons_exercise_kind_check
  check (exercise_kind in (${[...new Set(curriculum.map(l => l.kind))].map(quote).join(', ')}));

insert into public.chapters (slug,title,school_year,position,published) values
${[...chapters.values()].map(ch => `(${quote(ch.slug)},${quote(ch.title)},${ch.year},${ch.position},true)`).join(',\n')}
on conflict (slug) do update set title=excluded.title, school_year=excluded.school_year, position=excluded.position, published=excluded.published;

`;
for (const l of curriculum) {
  const metadata = {
    description: l.description,
    method: l.method,
    example: l.example,
    analogyTitle: l.analogyTitle,
    emoji: l.emoji,
    minutes: l.minutes,
    track: l.year >= 5 ? 'general-math6' : 'general',
    content_version: 2,
  };
  sql += `insert into public.lessons (chapter_id,slug,title,theory,analogy,common_mistake,exercise_kind,position,published,metadata)
select id,${quote(l.slug)},${quote(l.title)},${quote(l.theory)},${quote(l.analogy)},${quote(l.pitfall)},${quote(l.kind)},${l.position},true,${quote(JSON.stringify(metadata))}::jsonb
from public.chapters where slug=${quote(`${l.year}-${chapterSlugs[l.chapter]}`)}
on conflict (slug) do update set chapter_id=excluded.chapter_id,title=excluded.title,theory=excluded.theory,analogy=excluded.analogy,common_mistake=excluded.common_mistake,exercise_kind=excluded.exercise_kind,position=excluded.position,published=excluded.published,metadata=excluded.metadata;

`;
}
sql += 'commit;\n';
const target = new URL('../supabase/migrations/002_curriculum_all_years.sql', import.meta.url);
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== sql) throw new Error('SQL out of date. Run npm run sql:curriculum.');
  console.log('Le catalogue et la migration SQL sont synchronisés.');
} else {
  writeFileSync(target, sql);
  console.log(`${curriculum.length} leçons, ${chapters.size} chapitres : migration générée.`);
}
