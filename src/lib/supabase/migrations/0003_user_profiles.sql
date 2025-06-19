/* Add bio column to users table */
alter table public.users
add column if not exists bio text;

/* Create a view for user profiles with stats */
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
  count(distinct case when l.blurb is not null then l.match_id end) as races_reviewed,
  /* Aggregate ratings */
  round(avg(l.rating)::numeric, 1) as average_rating,
  /* Activity stats */
  max(l.watched_at) as last_watched_at,
  /* List stats */
  count(distinct li.list_id) as number_of_lists,
  /* Social stats */
  count(distinct f1.followee_id) as following_count,
  count(distinct f2.follower_id) as followers_count
from 
  public.users u
left join public.logs l on u.id = l.user_id
left join public.list_items li on li.list_id in (
  select id from public.lists where owner_id = u.id
)
left join public.follows f1 on f1.follower_id = u.id
left join public.follows f2 on f2.followee_id = u.id
group by 
  u.id,
  u.username,
  u.bio,
  u.avatar_url,
  u.created_at,
  u.updated_at;

comment on view public.user_profiles is 'Enriched user profiles with activity stats and social metrics';

/* Create a function to get user stats */
create or replace function get_user_stats(user_id uuid)
returns table (
  stat_name text,
  stat_value text
) as $$
begin
  return query
  select 'Races Watched'::text, races_watched::text
  from public.user_profiles
  where id = user_id
  union all
  select 'Average Rating', average_rating::text
  from public.user_profiles
  where id = user_id
  union all
  select 'Lists Created', number_of_lists::text
  from public.user_profiles
  where id = user_id
  union all
  select 'Following', following_count::text
  from public.user_profiles
  where id = user_id
  union all
  select 'Followers', followers_count::text
  from public.user_profiles
  where id = user_id;
end;
$$ language plpgsql; 