/* Create a debug function that returns profile stats */
create or replace function debug_profile(username_param text)
returns table (
  check_type text,
  result jsonb
) language plpgsql
as $$
begin
  -- Check user exists
  return query
  select 
    'user'::text as check_type,
    jsonb_build_object(
      'id', id,
      'username', username
    ) as result
  from public.users
  where username = username_param;

  -- Check user's logs
  return query
  select 
    'logs'::text,
    jsonb_agg(
      jsonb_build_object(
        'id', l.id,
        'match_id', l.match_id,
        'rating', l.rating,
        'review', l.review,
        'watched_at', l.watched_at,
        'race_name', m.title
      )
    )
  from public.logs l
  join public.users u on u.id = l.user_id
  join public.matches m on m.id = l.match_id
  where u.username = username_param;

  -- Check profile stats
  return query
  select 
    'profile_stats'::text,
    jsonb_build_object(
      'races_watched', races_watched,
      'races_rated', races_rated,
      'races_reviewed', races_reviewed,
      'average_rating', average_rating
    )
  from public.user_profiles
  where username = username_param;
end;
$$; 