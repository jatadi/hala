-- Test the fixed function
select * from get_race_details(5);

-- Double check the raw data
select
  m.id as race_id,
  count(distinct l.user_id) as watchers,
  round(avg(l.rating)::numeric, 1) as avg_rating
from public.matches m
left join public.logs l on l.match_id = m.id
where m.id = 5
group by m.id; 