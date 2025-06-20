-- Check matches table
select 'Matches check' as check,
  *
from public.matches
where id in (1, 2)
order by id;

-- Check f1_races table
select 'F1 races check' as check,
  *
from public.f1_races
where race_id in (1, 2)
order by race_id;

-- Check logs table
select 'Logs check' as check,
  l.*,
  m.title as race_title,
  m.sport,
  m.ext_id
from public.logs l
join public.matches m on m.id = l.match_id
where l.match_id in (1, 2)
order by l.match_id;

-- Check get_race_details function for both
select 'Race 1 details' as check,
  *
from get_race_details(1);

select 'Race 2 details' as check,
  *
from get_race_details(2);

-- Check RLS policies on all relevant tables
select 'RLS policies check' as check,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where tablename in ('matches', 'logs', 'f1_races')
order by tablename, policyname; 