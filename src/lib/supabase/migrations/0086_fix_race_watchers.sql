/* Fix the get_race_watchers function to properly join with f1_races table */
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
    u.username,
    u.avatar_url,
    l.created_at as watched_at,
    l.rating,
    l.review
  from public.logs l
  join public.users u on u.id = l.user_id
  join public.f1_races r on r.race_id = l.match_id
  where l.match_id = race_id_param
  order by l.created_at desc;
end;
$$;

-- Grant execute to authenticated users
grant execute on function get_race_watchers to authenticated, anon;

-- Test the function
select * from get_race_watchers(1); 