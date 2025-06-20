-- First delete all logs
delete from public.logs;

-- Then delete all races
delete from public.f1_races;

-- Reset profile stats for our test users
update public.users
set 
  races_watched = 0,
  races_rated = 0,
  races_reviewed = 0,
  average_rating = null,
  last_watched_at = null
where username in ('maxv', 'lewish');

-- Verify everything is clean
select 'Races count' as check,
  count(*) as count
from public.f1_races;

select 'Logs count' as check,
  count(*) as count
from public.logs;

select 'User stats' as check,
  username,
  races_watched,
  races_rated,
  races_reviewed,
  average_rating,
  last_watched_at
from public.users
where username in ('maxv', 'lewish')
order by username; 