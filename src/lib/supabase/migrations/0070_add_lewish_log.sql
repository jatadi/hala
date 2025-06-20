-- First get lewish's user ID to make sure we use the right one
select 'Lewish user info:' as check;
select id, username from public.users where username = 'lewish';

-- Add log entry for lewish watching race 13
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
  '2024-03-01 15:00:00+00' as watched_at,
  4.5 as rating,
  'Great test race!' as review
from public.users u
where u.username = 'lewish';

-- Verify the log was added
select 'New log entry:' as check;
select 
  l.*,
  u.username,
  r.race_name
from public.logs l
join public.users u on l.user_id = u.id
join public.f1_races r on l.match_id = r.race_id
where u.username = 'lewish' and l.match_id = 13;

-- Check updated profile stats
select 'Updated profile stats:' as check;
select * from public.get_profile_stats('lewish'); 