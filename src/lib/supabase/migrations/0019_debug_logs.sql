-- Check if the log exists
select 
  l.*,
  u.username,
  m.title as race_name
from public.logs l
join public.users u on u.id = l.user_id
join public.matches m on m.id = l.match_id
where m.id = 5;

-- Test the get_race_details function directly
select * from get_race_details(5);

-- Check the raw query that get_race_details uses
select 
  m.id as race_id,
  m.title as race_name,
  extract(year from m.starts_at)::int as year,
  m.starts_at as race_date,
  m.poster_url,
  m.meta->>'circuit' as circuit,
  m.meta->>'winner' as winner,
  m.meta->>'location' as location,
  m.meta->>'country' as country,
  round(avg(l.rating)::numeric, 1) as average_rating,
  count(distinct l.user_id) as watchers_count,
  m.starts_at < now() as is_past_race
from public.matches m
left join public.logs l on l.match_id = m.id
where m.id = 5
group by m.id, m.title, m.starts_at, m.poster_url, m.meta; 