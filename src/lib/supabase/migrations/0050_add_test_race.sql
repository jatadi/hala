-- Step 1: Insert into matches table
insert into public.matches (
  sport,
  ext_id,
  title,
  starts_at,
  meta,
  poster_url
) values (
  'f1',
  '2024-saudi-gp',
  '2024 STC Saudi Arabian Grand Prix',
  '2024-03-09 17:00:00+00',
  jsonb_build_object(
    'winner', 'Max Verstappen',
    'circuit', 'Jeddah Corniche Circuit',
    'country', 'Saudi Arabia',
    'location', 'Jeddah',
    'year', 2024
  ),
  'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245030/content/dam/fom-website/2023-races/Saudi-Arabia.png'
) returning id as match_id;

-- Log the inserted match
select 'New match' as step,
  m.*
from public.matches m
where m.ext_id = '2024-saudi-gp';

-- Log the F1 race view data
select 'New F1 race' as step,
  r.*
from public.f1_races r
join public.matches m on m.id = r.race_id
where m.ext_id = '2024-saudi-gp';

-- Step 3: Insert a test log (rating)
insert into public.logs (
  user_id,
  match_id,
  rating,
  watched_at
)
select
  'c7dd99ed-8bb4-44d2-8670-2437f98f5de8'::uuid,
  m.id,
  3.0,
  m.starts_at + interval '1 hour 30 minutes'
from public.matches m
where m.ext_id = '2024-saudi-gp';

-- Log the inserted log entry
select 'New log entry' as step,
  l.*,
  m.title as race_title
from public.logs l
join public.matches m on m.id = l.match_id
where m.ext_id = '2024-saudi-gp';

-- Step 4: Verify race details function
select 'Race details function check' as step,
  *
from get_race_details(
  (select id from public.matches where ext_id = '2024-saudi-gp')
); 