/* First drop the view since we can't modify it */
drop view if exists public.user_profiles;

/* Recreate the view */
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

/* Drop existing policies */
drop policy if exists "Users can read all users" on public.users;

/* Create new policies */
create policy "Anyone can read users"
  on public.users for select
  using (true);

/* Verify the data */
select 
  username,
  races_watched,
  races_rated,
  races_reviewed,
  average_rating
from public.user_profiles
where username = 'maxv'; 