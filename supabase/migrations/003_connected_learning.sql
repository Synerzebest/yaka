-- Exécuter après 001, seed et 002. Rejouable. Aucune donnée élève supprimée.
begin;
create index if not exists exercise_instances_user_created_idx on private.exercise_instances(user_id, created_at desc);

-- Ces trois fonctions sont exclusivement réservées au rôle serveur.
-- Le schéma private reste hors des schémas exposés par la Data API.
create or replace function public.server_create_exercise(p_user_id uuid, p_lesson_slug text, p_exercise jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare lesson public.lessons; instance private.exercise_instances;
begin
  if p_user_id is null or not exists(select 1 from public.profiles where id=p_user_id) then
    raise exception 'account_unavailable';
  end if;
  select l.* into lesson from public.lessons l join public.chapters c on c.id=l.chapter_id
    where l.slug=p_lesson_slug and l.published and c.published;
  if not found then raise exception 'lesson_unavailable'; end if;
  if jsonb_typeof(p_exercise) is distinct from 'object'
    or jsonb_typeof(p_exercise->'answer') is distinct from 'number'
    or p_exercise->>'kind' is distinct from lesson.exercise_kind then
    raise exception 'invalid_exercise';
  end if;
  -- Serialise le contrôle de débit par utilisateur, même sur plusieurs serveurs.
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,0));
  if (select count(*) from private.exercise_instances where user_id=p_user_id and created_at>now()-interval '1 minute')>=30 then
    raise exception 'exercise_rate_limit';
  end if;
  insert into private.exercise_instances(user_id,lesson_id,variables,expected_answer)
    values(p_user_id,lesson.id,p_exercise,(p_exercise->>'answer')::numeric) returning * into instance;
  return jsonb_build_object('id',instance.id,'expiresAt',instance.expires_at);
end;
$$;

create or replace function public.server_get_exercise(p_user_id uuid, p_instance_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare instance private.exercise_instances;
begin
  select * into instance from private.exercise_instances where id=p_instance_id and user_id=p_user_id;
  if not found then raise exception 'exercise_unavailable'; end if;
  return jsonb_build_object('exercise',instance.variables,'expiresAt',instance.expires_at);
end;
$$;

create or replace function public.server_record_attempt(
  p_user_id uuid, p_instance_id uuid, p_answer text, p_correct boolean, p_feedback text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare instance private.exercise_instances; attempt public.exercise_attempts;
begin
  -- Verrouillage : deux soumissions simultanées ne peuvent pas compter deux fois.
  select * into instance from private.exercise_instances where id=p_instance_id and user_id=p_user_id for update;
  if not found then raise exception 'exercise_unavailable'; end if;
  select * into attempt from public.exercise_attempts where instance_id=instance.id;
  if not found then
    if instance.expires_at <= clock_timestamp() then raise exception 'exercise_expired'; end if;
    if p_answer is null or char_length(trim(p_answer)) not between 1 and 100 or p_correct is null
      or p_feedback is null or char_length(p_feedback)>10000 then raise exception 'invalid_answer'; end if;
    insert into public.exercise_attempts(instance_id,user_id,lesson_id,submitted_answer,is_correct,feedback)
      values(instance.id,instance.user_id,instance.lesson_id,p_answer,p_correct,p_feedback) returning * into attempt;
  end if;
  -- Une nouvelle tentative réseau renvoie le premier résultat, même après expiration.
  return jsonb_build_object('id',attempt.id,'correct',attempt.is_correct,'feedback',attempt.feedback,
    'answer',attempt.submitted_answer,'createdAt',attempt.created_at);
end;
$$;

-- Agrégation dans PostgreSQL : pas de limite implicite de 1 000 lignes REST.
-- SECURITY INVOKER conserve les contrôles RLS du compte connecté.
create or replace function public.get_my_learning_progress()
returns jsonb language sql stable security invoker set search_path = '' as $$
  with own as (
    select * from public.lesson_progress where user_id=(select auth.uid())
  ), latest as (
    select distinct on (lesson_id) lesson_id,is_correct,created_at,id from public.exercise_attempts
    where user_id=(select auth.uid()) order by lesson_id,created_at desc,id desc
  )
  select jsonb_build_object(
    'correct',coalesce((select sum(correct_count) from own),0),
    'attempts',coalesce((select sum(attempt_count) from own),0),
    'topicCorrect',coalesce((select jsonb_object_agg(l.slug,o.correct_count) from own o join public.lessons l on l.id=o.lesson_id),'{}'::jsonb),
    'days',coalesce((select jsonb_agg(day order by day) from (
      select distinct (created_at at time zone 'Europe/Brussels')::date::text as day
      from public.exercise_attempts where user_id=(select auth.uid())
    ) d),'[]'::jsonb),
    'lastMistake',(select l.slug from latest a join public.lessons l on l.id=a.lesson_id
      where not a.is_correct order by a.created_at desc,a.id desc limit 1)
  );
$$;

revoke all on function public.server_create_exercise(uuid,text,jsonb) from public,anon,authenticated;
revoke all on function public.server_get_exercise(uuid,uuid) from public,anon,authenticated;
revoke all on function public.server_record_attempt(uuid,uuid,text,boolean,text) from public,anon,authenticated;
grant execute on function public.server_create_exercise(uuid,text,jsonb) to service_role;
grant execute on function public.server_get_exercise(uuid,uuid) to service_role;
grant execute on function public.server_record_attempt(uuid,uuid,text,boolean,text) to service_role;
revoke all on function public.get_my_learning_progress() from public,anon;
grant execute on function public.get_my_learning_progress() to authenticated;
commit;
