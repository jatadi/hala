-- Check maxv's user ID
select id, username from public.users where username = 'maxv';

-- Check all logs for maxv
select 
  l.*,
  m.title as race_name,
  m.sport
from public.logs l
join public.users u on u.id = l.user_id
join public.matches m on m.id = l.match_id
where u.username = 'maxv'
order by l.watched_at desc;

-- Check both races in matches table
select id, title, sport, ext_id
from public.matches 
where id in (1, 5);

-- Let's try to insert the log for race 5 again
insert into public.logs (user_id, match_id, rating, review, watched_at)
select 
  u.id,
  5,
  4.5,
  'Great race at Bahrain! The track layout really allows for some exciting battles.',
  '2025-06-19 18:20:39.740206+00'
from public.users u
where u.username = 'maxv'
on conflict (user_id, match_id) 
do update set 
  rating = 4.5,
  review = 'Great race at Bahrain! The track layout really allows for some exciting battles.',
  watched_at = '2025-06-19 18:20:39.740206+00'
returning *;

-- Check the logs again after insert
select 
  l.*,
  m.title as race_name,
  m.sport
from public.logs l
join public.users u on u.id = l.user_id
join public.matches m on m.id = l.match_id
where u.username = 'maxv'
order by l.watched_at desc;

-- Check race details for both races
select 'Race 1' as check, * from get_race_details(1);
select 'Race 5' as check, * from get_race_details(5); 