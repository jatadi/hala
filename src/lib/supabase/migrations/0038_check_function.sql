-- Check the function definition
select 'Function check' as check,
  p.proname,
  p.prosrc
from pg_proc p
join pg_namespace n on p.pronamespace = n.oid
where p.proname = 'get_race_details';

-- Run the function for all three races
select 'Function results' as check,
  r.*
from get_race_details(1) r
union all
select 'Function results' as check,
  r.*
from get_race_details(5) r
union all
select 'Function results' as check,
  r.*
from get_race_details(6) r; 