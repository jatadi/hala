-- First get maxv's user ID to make sure we use the right one
select 'Maxv user info:' as check;
select id, username from public.users where username = 'maxv';

-- Add log entry for maxv watching race 13
insert into public.logs (
  user_id,
  match_id,
  watched_at,
  rating,
  review
) 
select 
  u.id,
  13 as match_id,
  '2024-03-01 16:30:00+00' as watched_at,
  5.0 as rating,
  'Perfect test race, flawless execution!' as review
from public.users u
where u.username = 'maxv';

-- Verify the log was added
select 'New log entry:' as check;
select 
  l.*,
  u.username,
  r.race_name
from public.logs l
join public.users u on l.user_id = u.id
join public.f1_races r on l.match_id = r.race_id
where u.username = 'maxv' and l.match_id = 13;

-- Check updated race stats
select 'Race stats:' as check;
select * from public.get_race_details(13);

-- Check both profiles' stats
select 'Profile stats:' as check;
select 
  u.username,
  s.*
from public.users u
cross join lateral public.get_profile_stats(u.username) s
where u.username in ('maxv', 'lewish')
order by u.username; 