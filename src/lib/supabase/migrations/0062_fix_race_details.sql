-- Drop and recreate the function with proper table and UUID handling
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
) language plpgsql
as $$
declare
  _result record;
begin
  select 
    f.race_id,
    f.race_name,
    f.year,
    f.race_date,
    f.poster_url,
    f.circuit,
    f.winner,
    f.location,
    f.country,
    coalesce(round(avg(l.rating)::numeric, 1), 0.0) as average_rating,
    count(distinct l.user_id) as watchers_count,
    f.race_date < now() as is_past_race
  into _result
  from public.f1_races f
  left join public.logs l on l.match_id = f.race_id
  where f.race_id = race_id_param
  group by 
    f.race_id,
    f.race_name,
    f.year,
    f.race_date,
    f.poster_url,
    f.circuit,
    f.winner,
    f.location,
    f.country;

  -- If no rows were found, raise a notice
  if not found then
    raise notice 'No race found with ID: %', race_id_param;
    return;
  end if;

  -- Return the result
  race_id := _result.race_id;
  race_name := _result.race_name;
  year := _result.year;
  race_date := _result.race_date;
  poster_url := _result.poster_url;
  circuit := _result.circuit;
  winner := _result.winner;
  location := _result.location;
  country := _result.country;
  average_rating := _result.average_rating;
  watchers_count := _result.watchers_count;
  is_past_race := _result.is_past_race;
  return next;
end;
$$;

-- Grant execute to authenticated users
grant execute on function get_race_details to authenticated;

-- Verify the fix
select 'Race 12 details after fix' as check,
  *
from get_race_details(12); 