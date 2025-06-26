/* Create a view for detailed race logs */
create or replace view race_logs_detailed as
select 
  l.id,
  l.user_id,
  l.match_id as race_id,
  l.rating,
  l.review,
  l.created_at,
  l.updated_at,
  m.title as race_name,
  m.meta->>'circuit' as circuit,
  m.meta->>'country' as country
from public.logs l
join public.matches m on m.id = l.match_id; 