-- Drop and recreate the function with a simpler query
create or replace function get_race_details(race_id_param bigint)
returns table (
  race_id bigint,
  race_name text,
  year int,
  race_date timestamptz,
  poster_url text,
  circuit text,
  winner text,
  location text,
  country text,
  average_rating numeric,
  watchers_count bigint,
  is_past_race boolean
) language sql
as $function$
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
  where m.id = race_id_param
  group by m.id, m.title, m.starts_at, m.poster_url, m.meta
$function$;

-- Test the function with both races
select 'Race 1' as check, * from get_race_details(1);
select 'Race 5' as check, * from get_race_details(5);

-- Double check the raw data
select 'Raw data check' as check,
  m.id as race_id,
  m.title as race_name,
  count(distinct l.user_id) as watchers,
  round(avg(l.rating)::numeric, 1) as avg_rating
from public.matches m
left join public.logs l on l.match_id = m.id
where m.id in (1, 5)
group by m.id, m.title; 