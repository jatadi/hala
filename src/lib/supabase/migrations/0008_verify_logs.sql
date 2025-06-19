/* First verify the test user exists */
select id, username from public.users where username = 'maxv';

/* Then verify the Bahrain GP match exists */
select id, title, ext_id from public.matches where ext_id = '2024-bahrain-gp';

/* Check if the log exists */
select 
  l.*,
  u.username,
  m.title as race_name
from public.logs l
join public.users u on u.id = l.user_id
join public.matches m on m.id = l.match_id
where u.username = 'maxv';

/* If no log exists, create it */
insert into public.logs (user_id, match_id, rating, review, watched_at)
select
  u.id,
  m.id,
  4.5,
  'Incredible race! Max dominated from start to finish.',
  m.starts_at
from
  public.users u
  cross join public.matches m
where
  u.username = 'maxv'
  and m.ext_id = '2024-bahrain-gp'
  and not exists (
    select 1 
    from public.logs l2 
    where l2.user_id = u.id 
    and l2.match_id = m.id
  );

/* Verify the user_profiles view is working */
select 
  username,
  races_watched,
  races_rated,
  races_reviewed,
  average_rating
from public.user_profiles
where username = 'maxv'; 