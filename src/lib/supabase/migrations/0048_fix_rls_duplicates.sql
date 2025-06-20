-- Drop duplicate policies
drop policy if exists "Anyone can read logs" on public.logs;
drop policy if exists "Public read access for logs" on public.logs;
drop policy if exists "Users can insert their own logs" on public.logs;
drop policy if exists "Anyone can read public matches" on public.matches;
drop policy if exists "Public read access for matches" on public.matches;

-- Keep only the most specific policies
alter policy "Users can view their own logs" 
  on public.logs
  using ((auth.uid())::text = (user_id)::text);

alter policy "Anyone can read F1 races"
  on public.matches
  using (sport = 'f1'::sport_type);

-- Verify policies after cleanup
select 'RLS policies after cleanup' as check,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where tablename in ('matches', 'logs', 'f1_races')
order by tablename, policyname;

-- Test access with cleaned up policies
set local role authenticated;
set local "request.jwt.claims" to '{"sub": "c7dd99ed-8bb4-44d2-8670-2437f98f5de8"}';

-- Check if we can still see our own logs
select 'Log access check' as check,
  l.*,
  m.title as race_title
from public.logs l
join public.matches m on m.id = l.match_id
where l.user_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
and l.match_id in (1, 2)
order by l.match_id;

-- Check if we can see F1 races
select 'Race access check' as check,
  m.*
from public.matches m
where m.id in (1, 2)
order by m.id;

reset role; 