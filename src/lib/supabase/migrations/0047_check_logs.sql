-- Check log creation details
select 'Log creation details' as check,
  l.id as log_id,
  l.match_id,
  l.user_id,
  l.rating,
  l.review,
  l.watched_at,
  l.created_at,
  l.updated_at,
  m.title as race_title,
  m.sport,
  m.ext_id
from public.logs l
join public.matches m on m.id = l.match_id
where l.match_id in (1, 2)
order by l.created_at;

-- Check if logs are visible through RLS
set local role authenticated;
set local "request.jwt.claims" to '{"sub": "c7dd99ed-8bb4-44d2-8670-2437f98f5de8"}';

select 'RLS visibility check' as check,
  l.*,
  m.title as race_title
from public.logs l
join public.matches m on m.id = l.match_id
where l.match_id in (1, 2)
and l.user_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
order by l.created_at;

reset role;

-- Check if logs are counted correctly in the function
select 'Log counting check' as check,
  m.id as match_id,
  m.title,
  count(distinct l.user_id) as watchers_count,
  round(avg(l.rating)::numeric, 1) as average_rating
from public.matches m
left join public.logs l on l.match_id = m.id
where m.id in (1, 2)
group by m.id, m.title
order by m.id; 