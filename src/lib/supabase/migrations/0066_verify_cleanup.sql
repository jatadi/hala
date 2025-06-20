-- Check races
select 'Races in database:' as check;
select * from public.f1_races;

-- Check logs
select 'Logs in database:' as check;
select * from public.logs;

-- Check what get_race_details returns for race 1
select 'Race details function output:' as check;
select * from public.get_race_details(1);

-- Check profile stats
select 'Profile stats:' as check;
select 
  username,
  races_watched,
  races_rated,
  races_reviewed,
  average_rating
from public.users
where username in ('maxv', 'lewish'); 