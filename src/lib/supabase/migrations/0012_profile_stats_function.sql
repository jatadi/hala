/* Create a function to get profile stats directly */
create or replace function get_profile_stats(username_param text)
returns table (
  races_watched bigint,
  races_rated bigint,
  races_reviewed bigint,
  average_rating numeric,
  last_watched_at timestamptz,
  number_of_lists bigint,
  following_count bigint,
  followers_count bigint
) language sql
as $$
  select 
    count(distinct l.match_id) as races_watched,
    count(distinct case when l.rating is not null then l.match_id end) as races_rated,
    count(distinct case when l.review is not null then l.match_id end) as races_reviewed,
    round(avg(l.rating)::numeric, 1) as average_rating,
    max(l.watched_at) as last_watched_at,
    count(distinct li.list_id) as number_of_lists,
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
  where u.username = username_param
  group by u.id;
$$; 