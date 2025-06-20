-- Drop and recreate the profile stats function with the fixed query
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
  with user_logs as (
    select 
      l.match_id,
      l.rating,
      l.review,
      l.watched_at
    from public.logs l
    join public.users u on u.id = l.user_id
    where u.username = username_param
  )
  select 
    count(distinct match_id) as races_watched,
    count(distinct case when rating is not null then match_id end) as races_rated,
    count(distinct case when review is not null then match_id end) as races_reviewed,
    round(avg(rating)::numeric, 1) as average_rating,
    max(watched_at) as last_watched_at,
    (select count(distinct li.list_id) 
     from public.list_items li 
     join public.lists l on l.id = li.list_id 
     join public.users u on u.id = l.owner_id 
     where u.username = username_param) as number_of_lists,
    (select count(distinct followee_id) 
     from public.follows f 
     join public.users u on u.id = f.follower_id 
     where u.username = username_param) as following_count,
    (select count(distinct follower_id) 
     from public.follows f 
     join public.users u on u.id = f.followee_id 
     where u.username = username_param) as followers_count
  from user_logs;
$$;

-- Verify the fix by checking maxv's stats
select * from get_profile_stats('maxv'); 