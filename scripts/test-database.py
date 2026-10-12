"""Run migrations and RLS checks in an isolated PostgreSQL cluster using a local Unix socket.
Requires initdb, pg_ctl and psql. Never connects to the remote Supabase project.
"""
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).resolve().parent.parent
work = Path(tempfile.mkdtemp(prefix='yaka-database-tests-', dir='/private/tmp'))
def run(args):
    return subprocess.run(args, text=True, capture_output=True)
result = run(['initdb', '-D', str(work / 'data'), '--no-locale', '--encoding=UTF8', '--auth=trust', '--username=yaka_test'])
if result.returncode:
    print(result.stderr)
    raise SystemExit(result.returncode)
setup = """
create role anon; create role authenticated; create role service_role bypassrls;
create schema auth;
create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
"""
paths = ['supabase/migrations/001_initial_schema.sql', 'supabase/seed.sql',
         'supabase/migrations/002_curriculum_all_years.sql', 'supabase/migrations/003_connected_learning.sql',
         'supabase/migrations/003_connected_learning.sql',
         'supabase/migrations/004_formats_and_parental_consent.sql', 'supabase/migrations/004_formats_and_parental_consent.sql',
         'tests/sql/connected-learning.sql', 'tests/sql/parental-consent.sql']
script = work / 'test.sql'
script.write_text('\n'.join([setup] + [(root / path).read_text() for path in paths]))
result = run(['pg_ctl', '-D', str(work / 'data'), '-l', str(work / 'server.log'), '-o', f"-F -h '' -k {work} -p 55432", '-w', 'start'])
if result.returncode:
    print(result.stderr)
    print('Server log:', work / 'server.log')
    raise SystemExit(result.returncode)
try:
    result = run(['psql', '-h', str(work), '-p', '55432', '-U', 'yaka_test', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-f', str(script)])
    log = work / 'result.log'
    log.write_text(result.stdout + '\n' + result.stderr)
    if result.returncode or 'YAKA_DATABASE_TESTS_PASSED' not in result.stdout:
        print(result.stderr[-4000:])
        print('Test log:', log)
        raise SystemExit(1)
    print('PostgreSQL OK: migrations, replay, expiry, generation limit, profile RLS, answer isolation, per-user progress, answer formats and parental consent.')
finally:
    run(['pg_ctl', '-D', str(work / 'data'), '-m', 'fast', '-w', 'stop'])
