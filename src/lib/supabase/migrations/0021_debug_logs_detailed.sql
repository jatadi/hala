-- Check all logs for race 5
select 
  l.id as log_id,
  l.user_id,
  l.match_id,
  l.rating,
  l.review,
  l.watched_at,
  u.username,
  m.title as race_name
from public.logs l
join public.users u on u.id = l.user_id
join public.matches m on m.id = l.match_id
where m.id = 5;

-- Check if maxv's user ID is correct
select id, username from public.users where username = 'maxv';

-- Let's try inserting the log again with explicit user ID
insert into public.logs (user_id, match_id, watched_at, rating, review)
select 
  u.id,
  5,
  now(),
  4.5,
  'Great race at Bahrain! The track layout really allows for some exciting battles.'
from public.users u
where u.username = 'maxv'
on conflict (user_id, match_id) do update
set rating = 4.5,
    review = 'Great race at Bahrain! The track layout really allows for some exciting battles.',
    watched_at = now()
returning *; 