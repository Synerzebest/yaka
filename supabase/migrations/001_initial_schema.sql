-- Yaka · Exécuter dans le SQL Editor d'un nouveau projet Supabase.
-- Les écritures évaluées et la facturation sont réservées au backend.
begin;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Élève' check (char_length(display_name) between 1 and 80),
  school_year smallint not null default 2 check (school_year between 1 and 6),
  exercise_goal smallint not null default 5 check (exercise_goal in (3, 5, 10)),
  created_at timestamptz not null default now()
);
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(left(trim(new.raw_user_meta_data ->> 'display_name'),80),''),'Élève'));
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();
-- Couvre aussi les comptes déjà présents lors de l'installation.
insert into public.profiles (id) select id from auth.users on conflict (id) do nothing;

create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  school_year smallint not null check (school_year between 1 and 6),
  position integer not null default 0,
  published boolean not null default false
);
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  slug text unique not null,
  title text not null,
  theory text not null,
  analogy text not null,
  common_mistake text not null,
  exercise_kind text not null check (exercise_kind in ('fractions','equations','geometry')),
  position integer not null default 0,
  published boolean not null default false
);
create index lessons_chapter_id_idx on public.lessons(chapter_id);

-- Le serveur génère ces instances et conserve les réponses hors des tables publiques.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table private.exercise_instances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  variables jsonb not null,
  expected_answer numeric not null,
  expires_at timestamptz not null default now() + interval '1 hour',
  created_at timestamptz not null default now()
);
create index exercise_instances_user_id_idx on private.exercise_instances(user_id);
create table public.exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid not null unique references private.exercise_instances(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  submitted_answer text not null check (char_length(submitted_answer) <= 100),
  is_correct boolean not null,
  feedback text,
  created_at timestamptz not null default now()
);
create index exercise_attempts_user_time_idx on public.exercise_attempts(user_id, created_at desc);
create index exercise_attempts_lesson_idx on public.exercise_attempts(lesson_id);
create table public.lesson_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  correct_count integer not null default 0 check (correct_count >= 0),
  attempt_count integer not null default 0 check (attempt_count >= correct_count),
  completed_at timestamptz,
  last_practiced_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
create index lesson_progress_lesson_idx on public.lesson_progress(lesson_id);
create function private.update_learning_progress() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.lesson_progress (user_id, lesson_id, correct_count, attempt_count, last_practiced_at)
  values (new.user_id, new.lesson_id, new.is_correct::integer, 1, new.created_at)
  on conflict (user_id, lesson_id) do update set
    correct_count = public.lesson_progress.correct_count + new.is_correct::integer,
    attempt_count = public.lesson_progress.attempt_count + 1,
    last_practiced_at = new.created_at;
  update public.lesson_progress set completed_at = coalesce(completed_at, new.created_at)
  where user_id = new.user_id and lesson_id = new.lesson_id and correct_count >= 5;
  return new;
end;
$$;
create trigger after_exercise_attempt after insert on public.exercise_attempts
for each row execute function private.update_learning_progress();

create table public.badges (
  id text primary key,
  title text not null,
  required_correct integer not null check (required_correct >= 0)
);
-- Vue calculée : un badge ne peut pas être attribué par le navigateur.
create view public.earned_badges with (security_invoker = true) as
select p.id as user_id, b.id as badge_id, b.title
from public.profiles p cross join public.badges b
where b.required_correct <= (
  select count(*) from public.exercise_attempts a where a.user_id = p.id and a.is_correct
);

create table public.subscriptions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  stripe_customer_id text unique not null,
  stripe_subscription_id text unique,
  stripe_price_id text,
  status text not null default 'incomplete' check (status in ('incomplete','incomplete_expired','trialing','active','past_due','canceled','unpaid','paused')),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);
-- Déduplication transactionnelle des événements Stripe côté serveur.
create table private.stripe_events (
  event_id text primary key,
  event_type text not null,
  stripe_created_at timestamptz not null,
  processed_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.chapters enable row level security;
alter table public.lessons enable row level security;
alter table public.exercise_attempts enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.badges enable row level security;
alter table public.subscriptions enable row level security;
alter table private.exercise_instances enable row level security;
alter table private.stripe_events enable row level security;

create policy "Read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Published chapters" on public.chapters for select to anon, authenticated using (published);
create policy "Published lessons" on public.lessons for select to anon, authenticated using (published and exists (select 1 from public.chapters c where c.id = chapter_id and c.published));
create policy "Read own attempts" on public.exercise_attempts for select to authenticated using ((select auth.uid()) = user_id);
create policy "Read own progress" on public.lesson_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy "Read badge catalog" on public.badges for select to anon, authenticated using (true);
create policy "Read own subscription" on public.subscriptions for select to authenticated using ((select auth.uid()) = user_id);

revoke all on public.profiles, public.chapters, public.lessons, public.exercise_attempts, public.lesson_progress, public.badges, public.subscriptions, public.earned_badges from anon, authenticated;
grant select on public.chapters, public.lessons, public.badges to anon, authenticated;
grant select on public.profiles, public.exercise_attempts, public.lesson_progress, public.subscriptions, public.earned_badges to authenticated;
grant update (display_name, school_year, exercise_goal) on public.profiles to authenticated;
grant all on public.profiles, public.chapters, public.lessons, public.exercise_attempts, public.lesson_progress, public.badges, public.subscriptions to service_role;
grant usage on schema private to service_role;
grant all on private.exercise_instances, private.stripe_events to service_role;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function private.update_learning_progress() from public, anon, authenticated;
commit;
