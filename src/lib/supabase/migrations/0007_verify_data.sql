/* Check maxv's user ID */
select id, username from public.users where username = 'maxv';

/* Check logs for maxv */
select 
  l.*,
  m.title as race_name,
  m.starts_at as race_date
from public.logs l
join public.users u on u.id = l.user_id
join public.matches m on m.id = l.match_id
where u.username = 'maxv';

/* Check f1_races view content */
select * from public.f1_races;

/* Verify user_profiles view for maxv */
select * from public.user_profiles where username = 'maxv'; 