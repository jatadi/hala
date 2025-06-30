-- Drop existing objects if they exist
drop function if exists get_user_lists cascade;
drop table if exists public.lists cascade;

-- Create lists table
create table public.lists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.users(id) on delete cascade,
  title text not null,
  description text,
  is_public boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add a trigger to update the updated_at timestamp
create trigger update_lists_updated_at
  before update on public.lists
  for each row
  execute function update_updated_at_column();

-- Enable RLS
alter table public.lists enable row level security;

-- Create RLS policies

-- Anyone can read public lists
create policy "Anyone can read public lists"
  on public.lists
  for select
  using (
    is_public = true
    or owner_id = auth.uid()
  );

-- Users can create their own lists
create policy "Users can create their own lists"
  on public.lists
  for insert
  with check (owner_id = auth.uid());

-- Users can update their own lists
create policy "Users can update their own lists"
  on public.lists
  for update
  using (owner_id = auth.uid());

-- Users can delete their own lists
create policy "Users can delete their own lists"
  on public.lists
  for delete
  using (owner_id = auth.uid());

-- Grant permissions
grant all on public.lists to authenticated;
grant select on public.lists to anon;

-- Create a function to get user's lists
create or replace function get_user_lists(user_id_param uuid)
returns table (
  id uuid,
  title text,
  description text,
  is_public boolean,
  created_at timestamptz,
  updated_at timestamptz,
  race_count bigint
) language plpgsql security definer as $$
begin
  return query
  select 
    l.id,
    l.title,
    l.description,
    l.is_public,
    l.created_at,
    l.updated_at,
    count(li.race_id)::bigint as race_count
  from public.lists l
  left join public.list_items li on li.list_id = l.id
  where l.owner_id = user_id_param
  and (
    l.is_public = true 
    or 
    l.owner_id = auth.uid()
  )
  group by l.id, l.title, l.description, l.is_public, l.created_at, l.updated_at
  order by l.updated_at desc;
end;
$$;

-- Grant execute permission on the function
grant execute on function get_user_lists to authenticated, anon;

-- Test the setup
select 'Test lists table' as check,
  *
from public.lists; 