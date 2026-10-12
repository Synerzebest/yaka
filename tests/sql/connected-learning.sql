-- Local regression checks, executed by scripts/test-database.py only.
-- The three accounts are adults: migration 004 requires a birth date before graded exercises.
grant usage on schema auth to authenticated;
insert into auth.users(id,raw_user_meta_data) values
 ('10000000-0000-0000-0000-000000000001','{"display_name":"Alice","birth_date":"1990-01-01"}'),
 ('10000000-0000-0000-0000-000000000002','{"display_name":"Bob","birth_date":"1990-01-01"}'),
 ('10000000-0000-0000-0000-000000000003','{"display_name":"Rate","birth_date":"1990-01-01"}');
create temp table test_instance(id uuid);
insert into test_instance select (public.server_create_exercise(
 '10000000-0000-0000-0000-000000000001','equation-additive',
 '{"kind":"equations","answer":5,"prompt":"x + 2 = 7","steps":["x = 5"]}'
)->>'id')::uuid;

do $$ declare first_result jsonb; replay jsonb; instance uuid; begin
 select id into instance from test_instance;
 first_result:=public.server_record_attempt('10000000-0000-0000-0000-000000000001',instance,'5',true,'x = 5');
 replay:=public.server_record_attempt('10000000-0000-0000-0000-000000000001',instance,'999',false,'Changed');
 assert first_result=replay,'A replay changed the original response';
 assert (select count(*) from public.exercise_attempts)=1,'Replay counted twice';
 assert (select sum(correct_count) from public.lesson_progress)=1,'Progress counted twice';
 assert not has_function_privilege('authenticated','public.server_create_exercise(uuid,text,jsonb)','execute');
 assert not has_function_privilege('anon','public.server_get_exercise(uuid,uuid)','execute');
 assert not has_function_privilege('authenticated','public.server_record_attempt(uuid,uuid,text,boolean,text)','execute');
 assert has_function_privilege('service_role','public.server_record_attempt(uuid,uuid,text,boolean,text)','execute');
 begin
   perform public.server_get_exercise('10000000-0000-0000-0000-000000000002',instance);
   raise exception 'Wrong owner was accepted';
 exception when raise_exception then assert sqlerrm='exercise_unavailable'; end;
 begin
   perform public.server_record_attempt('10000000-0000-0000-0000-000000000002',instance,'5',true,'Fake');
   raise exception 'Wrong owner submitted';
 exception when raise_exception then assert sqlerrm='exercise_unavailable'; end;
 update private.exercise_instances set expires_at=now()-interval '1 hour' where id=instance;
 replay:=public.server_record_attempt('10000000-0000-0000-0000-000000000001',instance,'999',false,'Changed');
 assert replay=first_result,'A committed result should survive expiry';
end $$;

-- A different unanswered instance must expire without recording a result.
do $$ declare instance uuid; begin
 instance:=(public.server_create_exercise('10000000-0000-0000-0000-000000000001','equation-additive','{"kind":"equations","answer":2}')->>'id')::uuid;
 update private.exercise_instances set expires_at=now()-interval '1 second' where id=instance;
 begin
   perform public.server_record_attempt('10000000-0000-0000-0000-000000000001',instance,'2',true,'OK');
   raise exception 'Expired exercise was accepted';
 exception when raise_exception then assert sqlerrm='exercise_expired'; end;
 assert (select count(*) from public.exercise_attempts)=1;
end $$;

set role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000001',false);
do $$ declare snapshot jsonb; changed integer; begin
 assert (select count(*) from public.profiles)=1,'Profile RLS leaked another account';
 assert (select display_name from public.profiles)='Alice';
 update public.profiles set display_name='Alice updated' where id='10000000-0000-0000-0000-000000000001';
 assert (select display_name from public.profiles)='Alice updated';
 update public.profiles set display_name='Hacked' where id='10000000-0000-0000-0000-000000000002';
 get diagnostics changed=row_count;
 assert changed=0,'Could update another profile';
 snapshot:=public.get_my_learning_progress();
 assert (snapshot->>'correct')::int=1;
 assert (snapshot->>'attempts')::int=1;
 assert (snapshot->'topicCorrect'->>'equation-additive')::int=1;
 assert jsonb_array_length(snapshot->'days')=1;
 begin
   perform public.server_get_exercise('10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000010');
   raise exception 'Authenticated accessed privileged RPC';
 exception when insufficient_privilege then null; end;
 begin
   perform 1 from private.exercise_instances;
   raise exception 'Private answers leaked';
 exception when insufficient_privilege then null; end;
 begin
   insert into public.lesson_progress(user_id,lesson_id,correct_count,attempt_count)
   select '10000000-0000-0000-0000-000000000001',id,99,99 from public.lessons limit 1;
   raise exception 'Forged progress accepted';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000002',false);
do $$ begin
 assert (select display_name from public.profiles)='Bob';
 assert (select count(*) from public.exercise_attempts)=0,'Attempt RLS leaked';
 assert (public.get_my_learning_progress()->>'correct')::int=0,'Summary leaked another account';
end $$;
reset role;

-- Each account has its own generation limit.
do $$ declare i integer; begin
 for i in 1..30 loop
   perform public.server_create_exercise('10000000-0000-0000-0000-000000000003','equation-additive','{"kind":"equations","answer":2}');
 end loop;
 begin
   perform public.server_create_exercise('10000000-0000-0000-0000-000000000003','equation-additive','{"kind":"equations","answer":2}');
   raise exception 'Rate limit not enforced';
 exception when raise_exception then assert sqlerrm='exercise_rate_limit'; end;
end $$;
