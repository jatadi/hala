-- Get current function definition
select 'Current function' as check,
  p.prosrc
from pg_proc p
join pg_namespace n on p.pronamespace = n.oid
where p.proname = 'get_race_watchers';

-- Compare raw data between races
select 'Raw logs comparison' as check,
  l.match_id,
  l.user_id,
  l.rating,
  l.review,
  l.watched_at,
  up.username,
  up.avatar_url,
  m.title as race_title
from public.logs l
join public.matches m on m.id = l.match_id
join public.user_profiles up on up.id::text = l.user_id::text
where l.match_id in (1, 7)
order by l.match_id;

-- Create or replace the function with fixed query
create or replace function public.get_race_watchers(race_id_param bigint)
returns table (
  user_id uuid,
  username text,
  avatar_url text,
  watched_at timestamptz,
  rating numeric,
  review text
) language plpgsql security definer as $$
begin
  return query
  select 
    l.user_id::uuid,
    up.username,
    up.avatar_url,
    l.watched_at,
    l.rating,
    l.review
  from public.logs l
  join public.user_profiles up on up.id = l.user_id
  where l.match_id = race_id_param
  order by l.watched_at desc;
end;
$$; 