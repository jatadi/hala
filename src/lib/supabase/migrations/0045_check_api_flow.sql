-- Check if both races appear in the main listing
select 'Main listing check' as check,
  r.*,
  m.sport,
  m.ext_id,
  m.title as match_title
from public.f1_races r
join public.matches m on m.id = r.race_id
where r.race_id in (1, 2)
order by r.race_id;

-- Check if both races have proper relationships
select 'Relationships check' as check,
  m.id as match_id,
  m.sport,
  m.ext_id,
  m.title as match_title,
  r.race_id,
  r.race_name,
  count(l.id) as log_count,
  round(avg(l.rating)::numeric, 1) as avg_rating
from public.matches m
join public.f1_races r on r.race_id = m.id
left join public.logs l on l.match_id = m.id
where m.id in (1, 2)
group by m.id, m.sport, m.ext_id, m.title, r.race_id, r.race_name
order by m.id;

-- Check if both races are accessible to the current user
set local role authenticated;
set local "request.jwt.claims" to '{"sub": "c7dd99ed-8bb4-44d2-8670-2437f98f5de8"}';

select 'Auth access check' as check,
  m.id as match_id,
  m.title,
  l.rating,
  l.watched_at
from public.matches m
left join public.logs l on l.match_id = m.id 
  and l.user_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
where m.id in (1, 2)
order by m.id;

reset role; 