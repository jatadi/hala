-- Check the f1_races view
select * from f1_races where id in (1, 5);

-- Check if both races are properly tagged as F1
select id, title, sport, ext_id
from public.matches 
where id in (1, 5)
order by id; 