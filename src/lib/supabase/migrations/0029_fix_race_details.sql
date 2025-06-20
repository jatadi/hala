-- Drop and recreate the function with fixed counting
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
as $$
  with log_stats as (
    select
      l.match_id,
      round(avg(l.rating)::numeric, 1) as avg_rating,
      count(distinct l.user_id) as watch_count
    from public.logs l
    where l.match_id = race_id_param
    group by l.match_id
  )
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
    coalesce(ls.avg_rating, 0) as average_rating,
    coalesce(ls.watch_count, 0) as watchers_count,
    m.starts_at < now() as is_past_race
  from public.matches m
  left join log_stats ls on ls.match_id = m.id
  where m.id = race_id_param;
$$;

-- Verify the fix by checking both races
select 'Race 1' as check, * from get_race_details(1);
select 'Race 5' as check, * from get_race_details(5); 