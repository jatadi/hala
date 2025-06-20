-- Delete logs for races we want to remove
delete from public.logs
where match_id in (2, 5);

-- Delete F1 race entries
delete from public.f1_races
where race_id in (2, 5);

-- Delete match entries
delete from public.matches
where id in (2, 5);

-- Verify remaining data
select 'Remaining matches' as check,
  m.*
from public.matches m
order by m.id;

select 'Remaining F1 races' as check,
  r.*
from public.f1_races r
order by r.race_id;

select 'Remaining logs' as check,
  l.*,
  m.title as race_title
from public.logs l
join public.matches m on m.id = l.match_id
order by l.match_id; 