/* Create a function to get race details with average rating */
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
begin
  return query
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
    coalesce(round(avg(l.rating)::numeric, 1), 0.0) as average_rating,
    count(distinct l.user_id) as watchers_count,
    m.starts_at < now() as is_past_race
  from public.matches m
  left join public.logs l on l.match_id = m.id
  where m.id = race_id_param
  group by m.id, m.title, m.starts_at, m.poster_url, m.meta;

  -- If no rows were returned, raise a notice
  if not found then
    raise notice 'No race found with ID: %', race_id_param;
  end if;
end;
$$;

/* Create a function to get race watchers */
create or replace function get_race_watchers(race_id_param bigint)
returns table (
  user_id uuid,
  username text,
  avatar_url text,
  watched_at timestamptz,
  rating numeric,
  review text
) language sql
as $$
  select 
    u.id as user_id,
    u.username,
    u.avatar_url,
    l.watched_at,
    l.rating,
    l.review
  from public.logs l
  join public.users u on u.id = l.user_id
  where l.match_id = race_id_param
  order by l.watched_at desc;
$$; 