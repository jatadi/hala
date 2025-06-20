-- Drop existing RLS policies on logs
drop policy if exists "Users can view their own logs" on public.logs;
drop policy if exists "Users can insert their own logs" on public.logs;

-- Recreate RLS policies with proper UUID casting
create policy "Users can view their own logs"
  on public.logs
  for select
  using (
    auth.uid()::text = user_id::text
  );

create policy "Users can insert their own logs"
  on public.logs
  for insert
  with check (
    auth.uid()::text = user_id::text
  );

-- Verify policies
select 'RLS policies check' as check,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where tablename = 'logs';

-- Test as authenticated user
set local role authenticated;
set local "request.jwt.claims" to '{"sub": "c7dd99ed-8bb4-44d2-8670-2437f98f5de8"}';

-- Check if maxv can see their logs now
select 'Auth logs check' as check,
  l.*,
  m.title as race_title
from public.logs l
join public.matches m on m.id = l.match_id
where l.user_id::text = current_setting('request.jwt.claims', true)::json->>'sub';

-- Reset role
reset role; 