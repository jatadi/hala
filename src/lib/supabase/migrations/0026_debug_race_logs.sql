-- Check logs for both races
select 
  l.*,
  u.username,
  m.title as race_name,
  m.sport
from public.logs l
join public.users u on u.id = l.user_id
join public.matches m on m.id = l.match_id
where m.id in (1, 5)
order by m.id;

-- Check both races in matches table
select *
from public.matches
where id in (1, 5)
order by id;

-- Check if maxv's logs are being counted correctly
select 
  m.id as race_id,
  m.title,
  m.sport,
  l.rating,
  l.watched_at
from public.users u
join public.logs l on l.user_id = u.id
join public.matches m on m.id = l.match_id
where u.username = 'maxv'
order by l.watched_at desc; 