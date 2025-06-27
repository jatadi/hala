/* Fix the get_race_watchers function by removing unnecessary join */
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
  where l.match_id = race_id_param
  order by l.created_at desc;
end;
$$;

-- Grant execute to authenticated users
grant execute on function get_race_watchers to authenticated, anon;

-- Test the function
select * from get_race_watchers(414); 