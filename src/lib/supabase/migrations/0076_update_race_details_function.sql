-- Drop the existing function
drop function if exists public.get_race_details;

-- Recreate the function without location field and with round field
create or replace function public.get_race_details(race_id_param bigint)
returns table (
  race_id bigint,
  year integer,
  race_name text,
  race_date timestamptz,
  poster_url text,
  circuit text,
  winner text,
  country text,
  round integer,
  average_rating numeric,
  watchers_count bigint,
  is_past_race boolean,
  created_at timestamptz,
  updated_at timestamptz
) as $$
begin
  -- First check if the race exists
  if not exists (
    select 1 
    from public.f1_races f 
    where f.race_id = race_id_param
  ) then
    return;
  end if;

  return query
  select
    r.race_id,
    r.year::integer,
    r.race_name,
    r.race_date,
    r.poster_url,
    r.circuit,
    r.winner,
    r.country,
    r.round,
    coalesce(avg(l.rating)::numeric, null) as average_rating,
    count(distinct l.user_id)::bigint as watchers_count,
    r.race_date <= now() as is_past_race,
    r.created_at,
    r.updated_at
  from
    public.f1_races r
    left join public.logs l on r.race_id = l.match_id
  where
    r.race_id = race_id_param
  group by
    r.race_id,
    r.year,
    r.race_name,
    r.race_date,
    r.poster_url,
    r.circuit,
    r.winner,
    r.country,
    r.round,
    r.created_at,
    r.updated_at;
end;
$$ language plpgsql security definer;

comment on function public.get_race_details(bigint) is 'Get detailed information about a specific F1 race including ratings and watchers count';

-- Grant execute to authenticated users
grant execute on function get_race_details to authenticated, anon;

-- Verify the function works
select * from get_race_details(85); 