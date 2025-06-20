-- Test the get_race_details function
select * from get_race_details(5);
select * from get_race_details(1);

-- Debug the underlying query directly
select 
  m.id as race_id,
  m.title as race_name,
  m.sport,
  extract(year from m.starts_at)::int as year
from public.matches m
where m.id in (1, 5); 