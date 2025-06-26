-- Drop the existing view if it exists
drop view if exists public.user_profiles;

-- Recreate the view with follower counts
create view public.user_profiles as
select
    u.id,
    u.username,
    u.bio,
    u.avatar_url,
    u.created_at,
    u.updated_at,
    count(distinct l.match_id) as races_watched,
    count(distinct case when l.rating is not null then l.match_id end) as races_rated,
    round(avg(l.rating)::numeric, 2) as average_rating,
    max(l.watched_at) as last_watched_at,
    (select count(*) from public.follows where following_id = u.id) as followers_count,
    (select count(*) from public.follows where follower_id = u.id) as following_count
from public.users u
left join public.logs l on u.id = l.user_id
group by u.id, u.username, u.bio, u.avatar_url, u.created_at, u.updated_at; 