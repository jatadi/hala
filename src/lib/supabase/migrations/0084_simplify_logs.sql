-- First drop the dependent view
drop view if exists public.user_profiles;

-- Recreate the view using created_at instead of watched_at
create view public.user_profiles as
select 
  u.id,
  u.username,
  u.bio,
  u.avatar_url,
  u.created_at,
  u.updated_at,
  /* Stats */
  count(distinct l.match_id) as races_watched,
  count(distinct case when l.rating is not null then l.match_id end) as races_rated,
  count(distinct case when l.review is not null then l.match_id end) as races_reviewed,
  /* Aggregate ratings */
  round(avg(l.rating)::numeric, 1) as average_rating,
  /* Activity stats */
  max(l.created_at) as last_watched_at,
  /* List stats */
  count(distinct li.list_id) as number_of_lists,
  /* Social stats */
  count(distinct f1.following_id) as following_count,
  count(distinct f2.follower_id) as followers_count
from 
  public.users u
left join public.logs l on u.id = l.user_id
left join public.list_items li on li.list_id in (
  select id from public.lists where owner_id = u.id
)
left join public.follows f1 on f1.follower_id = u.id
left join public.follows f2 on f2.following_id = u.id
group by 
  u.id,
  u.username,
  u.bio,
  u.avatar_url,
  u.created_at,
  u.updated_at;

comment on view public.user_profiles is 'Enriched user profiles with activity stats and social metrics';

-- Now we can safely remove the watched_at column
alter table public.logs drop column if exists watched_at;

-- Drop existing functions before recreating them
drop function if exists log_race_watch(uuid, bigint, decimal, text);
drop function if exists get_race_logs(bigint);
drop function if exists get_user_race_log(uuid, bigint);

-- Update functions to use created_at instead of watched_at
create or replace function log_race_watch(
  user_id_param uuid,
  race_id_param bigint,
  rating_param decimal(2,1) default null,
  review_param text default null
) returns json language plpgsql security definer as $$
declare
  log_record record;
begin
  -- Insert or update the log
  insert into public.logs (
    user_id,
    match_id,
    rating,
    review
  ) values (
    user_id_param,
    race_id_param,
    rating_param,
    review_param
  )
  on conflict (user_id, match_id) do update
  set
    rating = EXCLUDED.rating,
    review = EXCLUDED.review,
    updated_at = now()
  returning * into log_record;

  return json_build_object(
    'id', log_record.id,
    'user_id', log_record.user_id,
    'match_id', log_record.match_id,
    'rating', log_record.rating,
    'review', log_record.review,
    'created_at', log_record.created_at,
    'updated_at', log_record.updated_at
  );
end;
$$;

-- Update get_race_logs to use created_at
create or replace function get_race_logs(
  race_id_param bigint
) returns table (
  log_id bigint,
  user_id uuid,
  username text,
  avatar_url text,
  rating decimal(2,1),
  review text,
  created_at timestamptz,
  updated_at timestamptz
) language sql stable as $$
  select
    l.id as log_id,
    l.user_id,
    u.username,
    u.avatar_url,
    l.rating,
    l.review,
    l.created_at,
    l.updated_at
  from public.logs l
  join public.users u on u.id = l.user_id
  where l.match_id = race_id_param
  order by l.created_at desc;
$$;

-- Update get_user_race_log to use created_at
create or replace function get_user_race_log(
  user_id_param uuid,
  race_id_param bigint
) returns table (
  log_id bigint,
  rating decimal(2,1),
  review text,
  created_at timestamptz,
  updated_at timestamptz,
  race_name text,
  race_date timestamptz
) language sql stable as $$
  select
    l.id as log_id,
    l.rating,
    l.review,
    l.created_at,
    l.updated_at,
    m.title as race_name,
    m.starts_at as race_date
  from public.logs l
  join public.matches m on m.id = l.match_id
  where l.user_id = user_id_param
  and l.match_id = race_id_param;
$$;

-- Grant execute permissions to authenticated users
grant execute on function log_race_watch(uuid, bigint, decimal, text) to authenticated;
grant execute on function get_race_logs(bigint) to authenticated;
grant execute on function get_user_race_log(uuid, bigint) to authenticated; 