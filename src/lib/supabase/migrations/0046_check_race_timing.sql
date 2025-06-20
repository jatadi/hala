-- Check when races were added
select 'Race creation timing' as check,
  m.id,
  m.title,
  m.created_at,
  m.updated_at,
  r.race_id,
  r.race_name,
  r.created_at as race_created_at,
  r.updated_at as race_updated_at
from public.matches m
join public.f1_races r on r.race_id = m.id
where m.id in (1, 2)
order by m.created_at;

-- Check if the get_race_details function is the latest version
select 'Function definition' as check,
  p.proname,
  p.prosrc,
  p.provolatile,
  p.prosecdef
from pg_proc p
join pg_namespace n on p.pronamespace = n.oid
where p.proname = 'get_race_details';

-- Check if both races have proper metadata
select 'Race metadata' as check,
  m.id,
  m.title,
  m.meta,
  m.sport,
  m.ext_id
from public.matches m
where m.id in (1, 2)
order by m.id; 