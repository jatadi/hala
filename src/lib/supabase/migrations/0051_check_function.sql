-- Get current function definition
select 'Current function definition' as check,
  p.proname,
  p.prosrc,
  p.provolatile,
  p.prosecdef
from pg_proc p
join pg_namespace n on p.pronamespace = n.oid
where p.proname = 'get_race_details';

-- Test function with both races
select 'Race 1 details' as check,
  *
from get_race_details(1);

select 'New race details' as check,
  *
from get_race_details(
  (select id from public.matches where ext_id = '2024-saudi-gp')
);

-- Check raw data for comparison
select 'Raw data check' as check,
  m.id as race_id,
  m.title as race_name,
  m.starts_at as race_date,
  m.poster_url,
  m.meta->>'circuit' as circuit,
  m.meta->>'winner' as winner,
  m.meta->>'location' as location,
  m.meta->>'country' as country,
  count(l.id) as watchers_count,
  round(avg(l.rating)::numeric, 1) as average_rating
from public.matches m
left join public.logs l on l.match_id = m.id
where m.id in (1, (select id from public.matches where ext_id = '2024-saudi-gp'))
group by m.id, m.title, m.starts_at, m.poster_url, m.meta
order by m.id; 