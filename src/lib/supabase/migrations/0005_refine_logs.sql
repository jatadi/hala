/* First drop the view that depends on logs table */
drop view if exists public.user_profiles;

/* Rename blurb to review and drop is_rewatch */
alter table public.logs
  rename column blurb to review;

alter table public.logs
  drop column if exists is_rewatch;

/* Recreate the user_profiles view with updated column name */
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

/* Add some example logs */
insert into public.logs (
  user_id,
  match_id,
  rating,
  review,
  watched_at
)
select
  u.id,
  m.id,
  4.5,
  'Incredible race! Max dominated from start to finish.',
  m.starts_at
from
  public.users u
  cross join public.matches m
where
  u.username = 'maxv'
  and m.ext_id = '2024-bahrain-gp'; 