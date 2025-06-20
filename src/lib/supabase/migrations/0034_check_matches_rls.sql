-- Check existing RLS policies
select 'RLS check' as check_type, * 
from pg_policies 
where tablename = 'matches';

-- Drop any existing policies
drop policy if exists "Public read access for F1 races" on public.matches;

-- Create new policy for public read access
create policy "Public read access for matches"
  on public.matches
  for select
  using (true);

-- Ensure proper grants are in place
grant select on public.matches to authenticated, anon;

-- Verify access to both races
select 'Matches check' as check_type,
  m.id,
  m.title,
  m.sport,
  count(distinct l.user_id) as watchers,
  round(avg(l.rating)::numeric, 1) as avg_rating
from public.matches m
left join public.logs l on l.match_id = m.id
where m.id in (1, 5)
group by m.id, m.title, m.sport; 