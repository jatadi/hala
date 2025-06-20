-- Show current state before deletion
select 'Current race stats:' as check;
select * from public.get_race_details(13);

select 'Current profile stats:' as check;
select 
  u.username,
  s.*
from public.users u
cross join lateral public.get_profile_stats(u.username) s
where u.username in ('maxv', 'lewish')
order by u.username;

-- Delete maxv's log
delete from public.logs l
using public.users u
where l.user_id = u.id
  and u.username = 'maxv'
  and l.match_id = 13;

-- Verify deletion and check updated stats
select 'Remaining logs:' as check;
select 
  l.*,
  u.username,
  r.race_name
from public.logs l
join public.users u on l.user_id = u.id
join public.f1_races r on l.match_id = r.race_id
where l.match_id = 13;

select 'Updated race stats:' as check;
select * from public.get_race_details(13);

select 'Updated profile stats:' as check;
select 
  u.username,
  s.*
from public.users u
cross join lateral public.get_profile_stats(u.username) s
where u.username in ('maxv', 'lewish')
order by u.username; 