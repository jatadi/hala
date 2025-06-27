/* Create activities view that combines logs and follows */
create or replace view public.activities as
select 
  'log' as type,
  l.id::text as activity_id,
  l.user_id,
  l.match_id as race_id,
  l.created_at,
  l.rating,
  l.review,
  u.username,
  u.avatar_url,
  r.race_name,
  r.circuit,
  r.country,
  null::uuid as target_user_id,
  null::text as target_username
from public.logs l
join public.users u on u.id = l.user_id
join public.f1_races r on r.race_id = l.match_id
union all
select 
  'follow' as type,
  f.follower_id || '_' || f.following_id as activity_id,
  f.follower_id as user_id,
  null::bigint as race_id,
  f.created_at,
  null::numeric as rating,
  null::text as review,
  u1.username,
  u1.avatar_url,
  null::text as race_name,
  null::text as circuit,
  null::text as country,
  f.following_id as target_user_id,
  u2.username as target_username
from public.follows f
join public.users u1 on u1.id = f.follower_id
join public.users u2 on u2.id = f.following_id;

comment on view public.activities is 'Combined view of all user activities including race logs and follows';

/* Create function to get feed for a specific user */
create or replace function get_feed_for_user(
  user_id_param uuid,
  limit_param integer default 20,
  offset_param integer default 0
) returns table (
  type text,
  activity_id text,
  user_id uuid,
  race_id bigint,
  created_at timestamptz,
  rating numeric,
  review text,
  username text,
  avatar_url text,
  race_name text,
  circuit text,
  country text,
  target_user_id uuid,
  target_username text
) language plpgsql security definer as $$
begin
  return query
  select a.*
  from public.activities a
  where a.user_id in (
    select following_id
    from public.follows
    where follower_id = user_id_param
    union
    select user_id_param -- Include user's own activities
  )
  order by a.created_at desc
  limit limit_param
  offset offset_param;
end;
$$;

comment on function get_feed_for_user(uuid, integer, integer) is 'Get activity feed for a user, including activities from followed users';

/* Grant access to the view and function */
grant select on public.activities to authenticated;
grant execute on function get_feed_for_user to authenticated; 