-- Check RLS policies on logs table
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

-- Check if maxv can see their own logs
set local role authenticated;
select current_user, current_setting('request.jwt.claims', true)::json->>'sub' as user_id;

select 'Auth logs check' as check,
  l.*,
  m.title as race_title
from public.logs l
join public.matches m on m.id = l.match_id
where l.user_id = current_setting('request.jwt.claims', true)::json->>'sub';

-- Reset role
reset role; 