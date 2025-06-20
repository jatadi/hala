-- Create a test user and get their ID
with new_user as (
  insert into public.users (username, bio, avatar_url)
  values (
    'lewish',
    'Seven-time F1 World Champion',
    'https://ui-avatars.com/api/?name=Lewis+Hamilton&background=00D2BE&color=fff'
  )
  returning id
)
-- Add some race logs for the test user
insert into public.logs (user_id, match_id, rating, review, watched_at)
select 
  new_user.id,
  match_id,
  rating,
  review,
  watched_at::timestamptz
from new_user,
(values
  (1, 5.0, 'Great start to the season!', '2024-03-02 16:00:00+00'::timestamptz),
  (7, 4.0, 'Exciting race in Jeddah', '2024-03-09 19:00:00+00'::timestamptz),
  (10, 5.0, 'Home race victory!', '2024-04-15 18:00:00+00'::timestamptz)
) as logs(match_id, rating, review, watched_at);

-- Verify the test profile stats
select 'Test profile stats' as check,
  *
from get_profile_stats('lewish'); 