-- 1. Check maxv's user ID
select 'User ID check' as check_type, id, username 
from public.users 
where username = 'maxv';

-- 2. Check both races in matches table
select 'Races check' as check_type, id, title, sport, ext_id
from public.matches 
where id in (1, 5);

-- 3. Check ALL logs for these races
select 
  'Logs check' as check_type,
  l.*,
  u.username,
  m.title as race_name,
  m.sport
from public.logs l
join public.users u on u.id = l.user_id
join public.matches m on m.id = l.match_id
where m.id in (1, 5)
order by m.id;

-- 4. Check the raw query that get_race_details uses
with log_stats as (
  select
    match_id,
    count(distinct user_id) as watchers_count,
    round(avg(rating)::numeric, 1) as avg_rating
  from public.logs
  where match_id in (1, 5)
  group by match_id
)
select 'Raw query check' as check_type,
  m.id as race_id,
  m.title as race_name,
  ls.watchers_count,
  ls.avg_rating
from public.matches m
left join log_stats ls on ls.match_id = m.id
where m.id in (1, 5)
order by m.id;

-- 5. Check if the sport field is set correctly
select 'Sport check' as check_type, id, title, sport
from public.matches
where id in (1, 5);

-- 6. Check if there are any RLS policies affecting the logs
select 'RLS check' as check_type, * 
from pg_policies 
where tablename = 'logs';

-- 7. Test the get_race_details function directly
select 'Function test 1' as check_type, * from get_race_details(1);
select 'Function test 5' as check_type, * from get_race_details(5);

-- 8. Check if the logs are properly linked
select 'Log links check' as check_type,
  l.id as log_id,
  l.user_id,
  l.match_id,
  u.username,
  m.title as race_name
from public.logs l
join public.users u on u.id = l.user_id
join public.matches m on m.id = l.match_id
where m.id in (1, 5)
order by m.id; 