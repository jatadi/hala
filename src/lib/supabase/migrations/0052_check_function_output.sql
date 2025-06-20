-- Get the function definition
select 'Function definition' as check,
  p.proname,
  p.prosrc
from pg_proc p
join pg_namespace n on p.pronamespace = n.oid
where p.proname = 'get_race_details';

-- Test each race separately



select 'Saudi GP details' as check,
  *
from get_race_details(7); 