-- Drop existing function
drop function if exists get_race_details;

-- Recreate function with proper UUID handling
create or replace function get_race_details(race_id_param bigint)
returns table (
  race_id bigint,
  race_name text,
  year integer,
  race_date timestamptz,
  poster_url text,
  circuit text,
  winner text,
  location text,
  country text,
  average_rating numeric,
  watchers_count bigint,
  is_past_race boolean
) as $$
begin
  return query
  select
    r.race_id,
    r.race_name,
    r.year::integer,
    r.race_date,
    r.poster_url,
    r.circuit,
    r.winner,
    r.location,
    r.country,
    round(avg(l.rating)::numeric, 1) as average_rating,
    count(distinct l.user_id)::bigint as watchers_count,
    r.race_date <= now() as is_past_race
  from public.f1_races r
  left join public.matches m on m.id = r.race_id
  left join public.logs l on l.match_id = m.id
  where r.race_id = race_id_param
  group by
    r.race_id,
    r.race_name,
    r.year,
    r.race_date,
    r.poster_url,
    r.circuit,
    r.winner,
    r.location,
    r.country;
end;
$$ language plpgsql security definer;

-- Grant execute to authenticated users
grant execute on function get_race_details to authenticated;

-- Test the function for all three races
select 'Race 1 details' as check,
  *
from get_race_details(1);

select 'Race 2 details' as check,
  *
from get_race_details(2);

select 'Race 5 details' as check,
  *
from get_race_details(5); 