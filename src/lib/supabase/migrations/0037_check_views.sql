-- Check if there are any views that might be affecting the races
select 'Views check' as check,
  schemaname,
  viewname,
  definition
from pg_views
where viewname like '%race%' or viewname like '%match%' or viewname like '%f1%';

-- Check if races appear differently in any views
select 'F1 races view check' as check,
  *
from public.f1_races
where race_id in (1, 5, 6); 