-- Add a race log for maxv
do $$ 
declare
  maxv_id uuid;
begin
  -- Get maxv's ID
  select id into maxv_id
  from public.users
  where username = 'maxv';

  -- Verify user exists
  if maxv_id is null then
    raise exception 'User maxv not found';
  end if;

  -- Create the race log
  insert into public.logs (
    user_id,
    match_id,
    rating,
    review,
    created_at
  ) values (
    maxv_id,
    414,
    5,
    'I won my 4th championship in this race',
    now()
  );

end $$;

-- Drop existing RLS policies on logs
drop policy if exists "Users can view their own logs" on public.logs;
drop policy if exists "Users can read all logs" on public.logs;

-- Create new policy for public read access to logs
create policy "Anyone can read logs"
  on public.logs
  for select
  using (true);

-- Grant necessary permissions
grant select on public.logs to authenticated, anon;

-- Test the fix by checking logs for race 414
select 'Race 414 logs' as check,
  l.*,
  u.username,
  m.title as race_name
from public.logs l
join public.users u on u.id = l.user_id
join public.matches m on m.id = l.match_id
where m.id = 414; 