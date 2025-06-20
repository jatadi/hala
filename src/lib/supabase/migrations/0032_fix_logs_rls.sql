-- Drop existing policies on logs table
drop policy if exists "Public read access for logs" on public.logs;

-- Create new policy for public read access to logs
create policy "Public read access for logs"
  on public.logs
  for select
  using (true);

-- Ensure proper grants are in place
grant select on public.logs to authenticated, anon;

-- Verify the fix by checking logs for both races
select 'Race 1 logs' as check,
  l.*,
  u.username,
  m.title as race_name
from public.logs l
join public.users u on u.id = l.user_id
join public.matches m on m.id = l.match_id
where m.id = 1;

select 'Race 5 logs' as check,
  l.*,
  u.username,
  m.title as race_name
from public.logs l
join public.users u on u.id = l.user_id
join public.matches m on m.id = l.match_id
where m.id = 5; 