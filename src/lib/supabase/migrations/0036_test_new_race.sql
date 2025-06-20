-- First, let's see what makes race 1 special
select 'Race 1 details' as check,
  m.*
from public.matches m
where m.id = 1;

-- Add a log for maxv for race 2 (Saudi Arabian GP)
insert into public.logs (
  user_id,
  match_id,
  rating,
  review,
  watched_at
)
select 
  u.id as user_id,
  2 as match_id,
  4.5 as rating,
  'Amazing night race! The track is incredibly fast.' as review,
  '2024-03-09 18:30:00+00' as watched_at
from public.users u
where u.username = 'maxv';

-- Verify all three races
select 'All races check' as check,
  m.id,
  m.title,
  m.sport,
  m.ext_id,
  count(distinct l.user_id) as watchers,
  round(avg(l.rating)::numeric, 1) as avg_rating
from public.matches m
left join public.logs l on l.match_id = m.id
where m.id in (1, 2, 5)
group by m.id, m.title, m.sport, m.ext_id
order by m.id; 