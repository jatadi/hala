-- First, let's check for duplicate profiles
select 'Duplicate profiles check' as check,
  username,
  count(*) as profile_count,
  array_agg(id) as profile_ids
from public.users
group by username
having count(*) > 1;

-- Delete duplicate profiles keeping the one with activity
delete from public.users u
where u.id = '8acde077-4c4c-4590-b538-bbd02dee25df'
and exists (
  select 1 
  from public.users u2 
  where u2.username = u.username 
  and u2.id != u.id
  and exists (
    select 1 
    from public.logs l 
    where l.user_id = u2.id
  )
);

-- Drop existing RLS policies
drop policy if exists "Users can read their own logs" on public.logs;
drop policy if exists "Users can create their own logs" on public.logs;
drop policy if exists "Users can update their own logs" on public.logs;
drop policy if exists "Users can delete their own logs" on public.logs;
drop policy if exists "Anyone can read logs" on public.logs;

-- Create new RLS policies with proper UUID handling
create policy "Users can read all logs"
  on public.logs
  for select
  using (true);

create policy "Users can create their own logs"
  on public.logs
  for insert
  with check (auth.uid()::text = user_id::text);

create policy "Users can update their own logs"
  on public.logs
  for update
  using (auth.uid()::text = user_id::text);

create policy "Users can delete their own logs"
  on public.logs
  for delete
  using (auth.uid()::text = user_id::text);

-- Verify the changes
select 'Profile check after cleanup' as check,
  u.id,
  u.username,
  count(l.id) as log_count
from public.users u
left join public.logs l on l.user_id = u.id
where u.username = 'maxv'
group by u.id, u.username; 