-- Check all tables and views
select 'Database objects' as check,
  schemaname,
  tablename,
  'table' as type
from pg_tables
where schemaname in ('public', 'auth')
union all
select schemaname,
  viewname as tablename,
  'view' as type
from pg_views
where schemaname in ('public', 'auth');

-- Check raw logs data for race 10
select 'Raw logs' as check,
  l.*,
  m.title as race_title,
  up.username,
  up.avatar_url
from public.logs l
join public.matches m on m.id = l.match_id
join public.user_profiles up on up.id::text = l.user_id::text
where l.match_id = 10;

-- Check get_race_watchers function definition
select 'Function definition' as check,
  p.proname,
  p.prosrc,
  p.proretset,
  p.provolatile,
  p.pronargs
from pg_proc p
join pg_namespace n on p.pronamespace = n.oid
where p.proname = 'get_race_watchers';

-- Test get_race_watchers function
select 'Watchers' as check,
  *
from public.get_race_watchers(10);

-- Compare with raw query that should match function logic
select 'Raw watchers data' as check,
  l.user_id,
  p.username,
  p.avatar_url,
  l.rating,
  l.review,
  l.watched_at
from public.logs l
join public.profiles p on p.id::text = l.user_id::text
where l.match_id = 10
order by l.watched_at desc; 