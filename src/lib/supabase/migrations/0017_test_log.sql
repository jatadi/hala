-- First, let's get maxv's user ID
with maxv_user as (
  select id from public.users where username = 'maxv'
)
-- Then insert the log
insert into public.logs (
  user_id,
  match_id,
  watched_at,
  rating,
  review
)
select
  maxv_user.id,
  5,  -- our test race ID
  now(),
  4.5,
  'Great race at Bahrain! The track layout really allows for some exciting battles.'
from maxv_user
returning *; 