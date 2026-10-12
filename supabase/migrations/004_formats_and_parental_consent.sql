-- Yaka · Exécuter après 001, seed, 002 et 003. Rejouable. Aucune donnée élève supprimée.
-- 1. Formats d'exercices : QCM et expressions en x en plus des nombres.
-- 2. Date de naissance et autorisation parentale pour les élèves de moins de 13 ans.
--    Le blocage est appliqué ici, dans la base : l'interface ne fait que l'expliquer.
begin;

-- ---------------------------------------------------------------------------
-- 1. Formats d'exercices
-- ---------------------------------------------------------------------------
-- Une expression n'a pas de valeur numérique unique : la réponse attendue reste dans variables.
alter table private.exercise_instances alter column expected_answer drop not null;

-- ---------------------------------------------------------------------------
-- 2. Âge et autorisation parentale
-- ---------------------------------------------------------------------------
alter table public.profiles add column if not exists birth_date date;
alter table public.profiles drop constraint if exists profiles_birth_date_check;
alter table public.profiles add constraint profiles_birth_date_check check (birth_date >= date '1900-01-01');

create table if not exists private.parental_consents (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  parent_email text not null check (char_length(parent_email) between 3 and 254),
  -- Seule l'empreinte SHA-256 du lien est conservée : le lien lui-même n'existe que dans l'e-mail.
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  notice_version text not null check (char_length(notice_version) between 1 and 40),
  requested_at timestamptz not null default now(),
  expires_at timestamptz not null,
  last_sent_at timestamptz not null default now(),
  window_started_at timestamptz not null default now(),
  sends_in_window integer not null default 1 check (sends_in_window >= 0),
  granted_at timestamptz
);
alter table private.parental_consents enable row level security;
revoke all on private.parental_consents from public, anon, authenticated;
grant all on private.parental_consents to service_role;

create or replace function private.today_brussels() returns date
language sql stable set search_path = '' as $$
  select (now() at time zone 'Europe/Brussels')::date;
$$;

create or replace function private.age_on(p_birth_date date, p_day date) returns integer
language sql immutable set search_path = '' as $$
  select extract(year from age(p_day, p_birth_date))::integer;
$$;

-- Une date déclarée invalide est ignorée : l'élève la renseignera ensuite dans son espace.
create or replace function private.parse_birth_date(p_value text) returns date
language plpgsql stable set search_path = '' as $$
declare result date;
begin
  if p_value is null or p_value !~ '^\d{4}-\d{2}-\d{2}$' then return null; end if;
  result := p_value::date;
  if result < date '1900-01-01' or private.age_on(result, private.today_brussels()) < 6 then return null; end if;
  return result;
exception when others then
  return null;
end;
$$;

-- 'allowed', 'birth_date_required' ou 'parental_consent_required'.
create or replace function private.access_status(p_user_id uuid) returns text
language sql stable security definer set search_path = '' as $$
  select case
    when p.birth_date is null then 'birth_date_required'
    when private.age_on(p.birth_date, private.today_brussels()) >= 13 then 'allowed'
    when exists (select 1 from private.parental_consents c where c.user_id = p.id and c.granted_at is not null) then 'allowed'
    else 'parental_consent_required'
  end
  from public.profiles p where p.id = p_user_id;
$$;

-- La date de naissance déclarée à l'inscription est recopiée dans le profil.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, birth_date)
  values (
    new.id,
    coalesce(nullif(left(trim(new.raw_user_meta_data ->> 'display_name'), 80), ''), 'Élève'),
    private.parse_birth_date(new.raw_user_meta_data ->> 'birth_date')
  );
  return new;
end;
$$;

-- L'élève renseigne sa date une seule fois. Une correction passe par le contact,
-- sinon il suffirait de se vieillir pour contourner l'autorisation parentale.
create or replace function public.set_my_birth_date(p_birth_date date) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); current_value date;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  select birth_date into current_value from public.profiles where id = uid for update;
  if not found then raise exception 'account_unavailable'; end if;
  if current_value is not null then raise exception 'birth_date_already_set'; end if;
  if p_birth_date is null or p_birth_date < date '1900-01-01'
    or private.age_on(p_birth_date, private.today_brussels()) < 6 then
    raise exception 'invalid_birth_date';
  end if;
  update public.profiles set birth_date = p_birth_date where id = uid;
  return public.get_my_access();
end;
$$;

create or replace function public.get_my_access() returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'status', private.access_status(p.id),
    'birthDate', p.birth_date,
    'consent', (select jsonb_build_object(
        'parentEmail', c.parent_email,
        'requestedAt', c.requested_at,
        'expiresAt', c.expires_at,
        'lastSentAt', c.last_sent_at,
        'grantedAt', c.granted_at
      ) from private.parental_consents c where c.user_id = p.id)
  )
  from public.profiles p where p.id = auth.uid();
$$;

-- Crée ou renouvelle la demande. Un nouvel envoi invalide le lien précédent.
create or replace function public.server_request_parental_consent(
  p_user_id uuid, p_parent_email text, p_token_hash text, p_notice_version text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare existing private.parental_consents; profile public.profiles; email text := lower(trim(p_parent_email));
begin
  select * into profile from public.profiles where id = p_user_id for update;
  if not found then raise exception 'account_unavailable'; end if;
  if private.access_status(p_user_id) <> 'parental_consent_required' then raise exception 'consent_not_required'; end if;
  if email is null or char_length(email) > 254 or email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    or email = (select lower(u.email) from auth.users u where u.id = p_user_id) then
    raise exception 'parent_email_invalid';
  end if;
  if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$' then raise exception 'invalid_token'; end if;
  select * into existing from private.parental_consents where user_id = p_user_id;
  if found then
    if existing.last_sent_at > now() - interval '2 minutes' then raise exception 'consent_rate_limit'; end if;
    if existing.window_started_at > now() - interval '1 day' and existing.sends_in_window >= 5 then raise exception 'consent_rate_limit'; end if;
    update private.parental_consents set
      parent_email = email, token_hash = p_token_hash, notice_version = p_notice_version,
      requested_at = now(), expires_at = now() + interval '7 days', last_sent_at = now(),
      window_started_at = case when existing.window_started_at > now() - interval '1 day' then existing.window_started_at else now() end,
      sends_in_window = case when existing.window_started_at > now() - interval '1 day' then existing.sends_in_window + 1 else 1 end
    where user_id = p_user_id;
  else
    insert into private.parental_consents (user_id, parent_email, token_hash, notice_version, expires_at)
    values (p_user_id, email, p_token_hash, p_notice_version, now() + interval '7 days');
  end if;
  return jsonb_build_object('displayName', profile.display_name, 'expiresAt', now() + interval '7 days');
end;
$$;

-- Ce que voit le parent en ouvrant le lien. Ne modifie rien : les clients mail ouvrent parfois les liens.
create or replace function public.server_get_parental_consent(p_token_hash text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare consent private.parental_consents; profile public.profiles;
begin
  select * into consent from private.parental_consents where token_hash = p_token_hash;
  if not found then raise exception 'consent_unavailable'; end if;
  select * into profile from public.profiles where id = consent.user_id;
  return jsonb_build_object(
    'status', case when consent.granted_at is not null then 'granted' when consent.expires_at <= now() then 'expired' else 'pending' end,
    'displayName', profile.display_name,
    'studentEmail', (select u.email from auth.users u where u.id = consent.user_id),
    'birthDate', profile.birth_date,
    'schoolYear', profile.school_year,
    'parentEmail', consent.parent_email,
    'expiresAt', consent.expires_at,
    'grantedAt', consent.granted_at
  );
end;
$$;

-- 'grant' enregistre l'autorisation. 'refuse' (ou un retrait ultérieur) supprime le compte
-- et, par cascade, le profil, les résultats et la demande.
create or replace function public.server_decide_parental_consent(p_token_hash text, p_decision text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare consent private.parental_consents;
begin
  select * into consent from private.parental_consents where token_hash = p_token_hash for update;
  if not found then raise exception 'consent_unavailable'; end if;
  if p_decision = 'grant' then
    if consent.granted_at is null and consent.expires_at <= now() then raise exception 'consent_expired'; end if;
    update private.parental_consents set granted_at = coalesce(granted_at, now()) where user_id = consent.user_id;
    return jsonb_build_object('decision', 'granted');
  elsif p_decision = 'refuse' then
    delete from auth.users where id = consent.user_id;
    return jsonb_build_object('decision', 'deleted');
  end if;
  raise exception 'invalid_decision';
end;
$$;

-- Comptes de moins de 13 ans sans autorisation après 30 jours. À planifier (pg_cron) ou lancer
-- manuellement depuis le SQL Editor : select private.purge_unconsented_minor_accounts();
create or replace function private.purge_unconsented_minor_accounts() returns integer
language plpgsql security definer set search_path = '' as $$
declare removed integer;
begin
  with targets as (
    select p.id from public.profiles p
    where p.birth_date is not null
      and private.access_status(p.id) = 'parental_consent_required'
      and p.created_at < now() - interval '30 days'
  )
  delete from auth.users u using targets t where u.id = t.id;
  get diagnostics removed = row_count;
  return removed;
end;
$$;

-- Les exercices évalués exigent un accès autorisé. Les réponses peuvent être un nombre ou une liste de coefficients.
create or replace function public.server_create_exercise(p_user_id uuid, p_lesson_slug text, p_exercise jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare lesson public.lessons; instance private.exercise_instances; access text; answer jsonb := p_exercise->'answer';
begin
  if p_user_id is null or not exists(select 1 from public.profiles where id=p_user_id) then
    raise exception 'account_unavailable';
  end if;
  access := private.access_status(p_user_id);
  if access <> 'allowed' then raise exception '%', access; end if;
  select l.* into lesson from public.lessons l join public.chapters c on c.id=l.chapter_id
    where l.slug=p_lesson_slug and l.published and c.published;
  if not found then raise exception 'lesson_unavailable'; end if;
  if jsonb_typeof(p_exercise) is distinct from 'object'
    or p_exercise->>'kind' is distinct from lesson.exercise_kind
    or not (
      jsonb_typeof(answer) = 'number'
      or (jsonb_typeof(answer) = 'array' and jsonb_array_length(answer) between 1 and 10
          and not exists (select 1 from jsonb_array_elements(answer) e where jsonb_typeof(e) <> 'number'))
    ) then
    raise exception 'invalid_exercise';
  end if;
  -- Serialise le contrôle de débit par utilisateur, même sur plusieurs serveurs.
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,0));
  if (select count(*) from private.exercise_instances where user_id=p_user_id and created_at>now()-interval '1 minute')>=30 then
    raise exception 'exercise_rate_limit';
  end if;
  insert into private.exercise_instances(user_id,lesson_id,variables,expected_answer)
    values(p_user_id,lesson.id,p_exercise,case when jsonb_typeof(answer)='number' then (answer#>>'{}')::numeric end)
    returning * into instance;
  return jsonb_build_object('id',instance.id,'expiresAt',instance.expires_at);
end;
$$;

revoke all on function private.today_brussels() from public, anon, authenticated;
revoke all on function private.age_on(date, date) from public, anon, authenticated;
revoke all on function private.parse_birth_date(text) from public, anon, authenticated;
revoke all on function private.access_status(uuid) from public, anon, authenticated;
revoke all on function private.purge_unconsented_minor_accounts() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_my_birth_date(date) from public, anon;
revoke all on function public.get_my_access() from public, anon;
grant execute on function public.set_my_birth_date(date) to authenticated;
grant execute on function public.get_my_access() to authenticated;
revoke all on function public.server_request_parental_consent(uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.server_get_parental_consent(text) from public, anon, authenticated;
revoke all on function public.server_decide_parental_consent(text, text) from public, anon, authenticated;
revoke all on function public.server_create_exercise(uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.server_request_parental_consent(uuid, text, text, text) to service_role;
grant execute on function public.server_get_parental_consent(text) to service_role;
grant execute on function public.server_decide_parental_consent(text, text) to service_role;
grant execute on function public.server_create_exercise(uuid, text, jsonb) to service_role;
grant execute on function private.purge_unconsented_minor_accounts() to service_role;
commit;
