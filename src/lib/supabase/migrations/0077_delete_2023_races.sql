-- First, let's delete any logs associated with 2023 races
delete from public.logs
where match_id in (
  select id 
  from public.matches 
  where sport = 'f1' 
  and id > 300
  and extract(year from starts_at) = 2023
);

-- Then delete the races themselves
delete from public.matches
where sport = 'f1'
and id > 300
and extract(year from starts_at) = 2023;

-- Verify deletion
select 'Remaining F1 races' as check,
  race_id,
  race_name,
  year,
  race_date
from public.f1_races
order by race_date; 