/* Drop existing views to recreate them in correct order */
drop view if exists public.user_profiles;
drop view if exists public.f1_races;

/* Recreate F1 races view */
create view public.f1_races as
select
  id as race_id,
  title as race_name,
  extract(year from starts_at) as year,
  starts_at as race_date,
  poster_url,
  meta->>'circuit' as circuit,
  meta->>'winner' as winner,
  meta->>'location' as location,
  meta->>'country' as country,
  created_at,
  updated_at
from public.matches
where sport = 'f1';

comment on view public.f1_races is 'Specialized view for F1 races with extracted metadata fields';

/* Recreate user profiles view with proper log counting */
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

/* Let's verify our data */
select 'Checking user maxv logs' as check_type, count(*) as count
from public.logs l
join public.users u on u.id = l.user_id
where u.username = 'maxv';

select 'Checking maxv profile stats' as check_type, races_watched, races_rated, races_reviewed
from public.user_profiles
where username = 'maxv';

select 'Checking F1 races view' as check_type, count(*) as count
from public.f1_races; 