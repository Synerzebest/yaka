-- Local regression checks for migration 004, executed by scripts/test-database.py only.
-- Ages are relative to today, so the checks stay valid over time.
insert into auth.users(id,email,raw_user_meta_data) values
 ('20000000-0000-0000-0000-000000000001','minor@example.com',jsonb_build_object('display_name','Mina','birth_date',to_char(current_date-interval '10 years','YYYY-MM-DD'))),
 ('20000000-0000-0000-0000-000000000002','teen@example.com',jsonb_build_object('display_name','Théo','birth_date',to_char(current_date-interval '15 years','YYYY-MM-DD'))),
 ('20000000-0000-0000-0000-000000000003','nodate@example.com','{"display_name":"Nora"}'),
 ('20000000-0000-0000-0000-000000000004','refused@example.com',jsonb_build_object('display_name','Rémi','birth_date',to_char(current_date-interval '11 years','YYYY-MM-DD'))),
 ('20000000-0000-0000-0000-000000000005','old@example.com',jsonb_build_object('display_name','Olga','birth_date',to_char(current_date-interval '12 years','YYYY-MM-DD'))),
 ('20000000-0000-0000-0000-000000000006','invalid@example.com','{"display_name":"Ivan","birth_date":"2020-13-45"}');

do $$ begin
 assert (select birth_date from public.profiles where id='20000000-0000-0000-0000-000000000001')=(current_date-interval '10 years')::date,'Signup birth date not copied';
 assert (select birth_date from public.profiles where id='20000000-0000-0000-0000-000000000006') is null,'Invalid birth date accepted';
 assert private.access_status('20000000-0000-0000-0000-000000000001')='parental_consent_required';
 assert private.access_status('20000000-0000-0000-0000-000000000002')='allowed';
 assert private.access_status('20000000-0000-0000-0000-000000000003')='birth_date_required';
 assert private.age_on(date '2013-10-12',date '2026-10-12')=13,'Thirteenth birthday';
 assert private.age_on(date '2013-10-13',date '2026-10-12')=12,'Day before the thirteenth birthday';
 begin
   perform public.server_create_exercise('20000000-0000-0000-0000-000000000001','equation-additive','{"kind":"equations","answer":2}');
   raise exception 'Minor without consent created an exercise';
 exception when raise_exception then assert sqlerrm='parental_consent_required',sqlerrm; end;
 begin
   perform public.server_create_exercise('20000000-0000-0000-0000-000000000003','equation-additive','{"kind":"equations","answer":2}');
   raise exception 'Account without birth date created an exercise';
 exception when raise_exception then assert sqlerrm='birth_date_required',sqlerrm; end;
 -- Polynomial answers are lists of coefficients; anything else is refused.
 perform public.server_create_exercise('20000000-0000-0000-0000-000000000002','3-distributivite','{"kind":"distributivity","answer":[-27,2]}');
 assert (select expected_answer from private.exercise_instances order by created_at desc limit 1) is null;
 begin
   perform public.server_create_exercise('20000000-0000-0000-0000-000000000002','3-distributivite','{"kind":"distributivity","answer":["x"]}');
   raise exception 'Invalid answer accepted';
 exception when raise_exception then assert sqlerrm='invalid_exercise',sqlerrm; end;
end $$;

-- Students read their own status, set a missing birth date once, and cannot touch consent data.
set role authenticated;
select set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000003',false);
do $$ declare access jsonb; begin
 assert (public.get_my_access()->>'status')='birth_date_required';
 access:=public.set_my_birth_date((current_date-interval '16 years')::date);
 assert access->>'status'='allowed',access::text;
 begin
   perform public.set_my_birth_date((current_date-interval '30 years')::date);
   raise exception 'Birth date changed twice';
 exception when raise_exception then assert sqlerrm='birth_date_already_set',sqlerrm; end;
 begin
   update public.profiles set birth_date='1990-01-01' where id='20000000-0000-0000-0000-000000000003';
   raise exception 'Birth date updated directly';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','20000000-0000-0000-0000-000000000001',false);
do $$ begin
 assert (public.get_my_access()->>'status')='parental_consent_required';
 begin
   perform public.set_my_birth_date((current_date-interval '20 years')::date);
   raise exception 'Minor aged up';
 exception when raise_exception then assert sqlerrm='birth_date_already_set',sqlerrm; end;
 begin
   perform 1 from private.parental_consents;
   raise exception 'Consent table readable';
 exception when insufficient_privilege then null; end;
 begin
   perform public.server_decide_parental_consent(repeat('a',64),'grant');
   raise exception 'Student granted consent';
 exception when insufficient_privilege then null; end;
 begin
   perform public.server_request_parental_consent('20000000-0000-0000-0000-000000000001','parent@example.com',repeat('a',64),'v1');
   raise exception 'Student requested consent directly';
 exception when insufficient_privilege then null; end;
end $$;
reset role;

-- Server-side request, rate limit, renewal, expiry and grant.
do $$ declare page jsonb; begin
 begin
   perform public.server_request_parental_consent('20000000-0000-0000-0000-000000000001','Minor@example.com',repeat('a',64),'v1');
   raise exception 'Own address accepted as parent';
 exception when raise_exception then assert sqlerrm='parent_email_invalid',sqlerrm; end;
 begin
   perform public.server_request_parental_consent('20000000-0000-0000-0000-000000000002','parent@example.com',repeat('a',64),'v1');
   raise exception 'Consent requested for a 15-year-old';
 exception when raise_exception then assert sqlerrm='consent_not_required',sqlerrm; end;
 perform public.server_request_parental_consent('20000000-0000-0000-0000-000000000001',' Parent@Example.com ',repeat('a',64),'v1');
 assert (select parent_email from private.parental_consents where user_id='20000000-0000-0000-0000-000000000001')='parent@example.com';
 begin
   perform public.server_request_parental_consent('20000000-0000-0000-0000-000000000001','parent@example.com',repeat('b',64),'v1');
   raise exception 'Immediate resend accepted';
 exception when raise_exception then assert sqlerrm='consent_rate_limit',sqlerrm; end;
 update private.parental_consents set last_sent_at=now()-interval '3 minutes' where user_id='20000000-0000-0000-0000-000000000001';
 perform public.server_request_parental_consent('20000000-0000-0000-0000-000000000001','parent@example.com',repeat('b',64),'v1');
 begin
   perform public.server_get_parental_consent(repeat('a',64));
   raise exception 'Replaced link still works';
 exception when raise_exception then assert sqlerrm='consent_unavailable',sqlerrm; end;
 page:=public.server_get_parental_consent(repeat('b',64));
 assert page->>'status'='pending' and page->>'displayName'='Mina' and page->>'studentEmail'='minor@example.com',page::text;
 update private.parental_consents set sends_in_window=5,last_sent_at=now()-interval '1 hour' where user_id='20000000-0000-0000-0000-000000000001';
 begin
   perform public.server_request_parental_consent('20000000-0000-0000-0000-000000000001','parent@example.com',repeat('c',64),'v1');
   raise exception 'Daily limit not enforced';
 exception when raise_exception then assert sqlerrm='consent_rate_limit',sqlerrm; end;
 update private.parental_consents set expires_at=now()-interval '1 second' where user_id='20000000-0000-0000-0000-000000000001';
 assert public.server_get_parental_consent(repeat('b',64))->>'status'='expired';
 begin
   perform public.server_decide_parental_consent(repeat('b',64),'grant');
   raise exception 'Expired link granted consent';
 exception when raise_exception then assert sqlerrm='consent_expired',sqlerrm; end;
 update private.parental_consents set expires_at=now()+interval '1 day' where user_id='20000000-0000-0000-0000-000000000001';
 assert public.server_decide_parental_consent(repeat('b',64),'grant')->>'decision'='granted';
 assert public.server_get_parental_consent(repeat('b',64))->>'status'='granted';
 assert private.access_status('20000000-0000-0000-0000-000000000001')='allowed';
 perform public.server_create_exercise('20000000-0000-0000-0000-000000000001','equation-additive','{"kind":"equations","answer":2}');
 begin
   perform public.server_request_parental_consent('20000000-0000-0000-0000-000000000001','other@example.com',repeat('d',64),'v1');
   raise exception 'Granted consent was replaced';
 exception when raise_exception then assert sqlerrm='consent_not_required',sqlerrm; end;
end $$;

-- A refusal deletes the account and its data; unanswered requests are purged after 30 days.
do $$ declare removed integer; begin
 perform public.server_request_parental_consent('20000000-0000-0000-0000-000000000004','parent2@example.com',repeat('e',64),'v1');
 assert public.server_decide_parental_consent(repeat('e',64),'refuse')->>'decision'='deleted';
 assert not exists(select 1 from auth.users where id='20000000-0000-0000-0000-000000000004');
 assert not exists(select 1 from public.profiles where id='20000000-0000-0000-0000-000000000004');
 assert not exists(select 1 from private.parental_consents where token_hash=repeat('e',64));
 begin
   perform public.server_decide_parental_consent(repeat('f',64),'grant');
   raise exception 'Unknown link accepted';
 exception when raise_exception then assert sqlerrm='consent_unavailable',sqlerrm; end;
 update public.profiles set created_at=now()-interval '31 days' where id in ('20000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000006');
 removed:=private.purge_unconsented_minor_accounts();
 assert removed=1,format('Purged %s accounts',removed);
 assert not exists(select 1 from auth.users where id='20000000-0000-0000-0000-000000000005');
 assert exists(select 1 from auth.users where id='20000000-0000-0000-0000-000000000001'),'Consented minor purged';
 assert exists(select 1 from auth.users where id='20000000-0000-0000-0000-000000000006'),'Account without birth date purged';
end $$;
select 'YAKA_DATABASE_TESTS_PASSED' as result;
