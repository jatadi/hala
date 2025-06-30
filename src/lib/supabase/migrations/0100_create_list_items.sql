-- Drop dependent views first
drop view if exists public.user_profiles cascade;

-- Drop existing objects if they exist
drop function if exists get_list_items cascade;
drop function if exists reorder_list_items cascade;
drop function if exists add_race_to_list cascade;
drop policy if exists "Anyone can read list items from public or own lists" on public.list_items;
drop policy if exists "List owners can manage items" on public.list_items;
drop table if exists public.list_items cascade;

-- Create list_items table
create table public.list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references public.lists(id) on delete cascade,
  race_id integer references public.matches(id),
  note text,
  display_order integer not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(list_id, race_id),
  unique(list_id, display_order)
);

-- Add a trigger to update the updated_at timestamp
create trigger update_list_items_updated_at
  before update on public.list_items
  for each row
  execute function update_updated_at_column();

-- Enable RLS
alter table public.list_items enable row level security;

-- Create RLS policies

-- Anyone can read items from public lists or their own lists
create policy "Anyone can read list items from public or own lists"
  on public.list_items
  for select
  using (
    exists (
      select 1 from public.lists l
      where l.id = list_items.list_id
      and (l.is_public = true or l.owner_id = auth.uid())
    )
  );

-- Only list owners can create/update/delete items
create policy "List owners can manage items"
  on public.list_items
  for all
  using (
    exists (
      select 1 from public.lists l
      where l.id = list_items.list_id
      and l.owner_id = auth.uid()
    )
  );

-- Create helper functions

-- Function to add a race to a list
create or replace function add_race_to_list(
  p_list_id uuid,
  p_race_id integer,
  p_note text default null
) returns uuid language plpgsql security definer as $$
declare
  v_next_order integer;
  v_item_id uuid;
begin
  -- Check if user owns the list
  if not exists (
    select 1 from public.lists
    where id = p_list_id
    and owner_id = auth.uid()
  ) then
    raise exception 'Not authorized to modify this list';
  end if;

  -- Get next display order
  select coalesce(max(display_order), 0) + 1
  into v_next_order
  from public.list_items
  where list_id = p_list_id;

  -- Insert the item
  insert into public.list_items (
    list_id,
    race_id,
    note,
    display_order
  )
  values (
    p_list_id,
    p_race_id,
    p_note,
    v_next_order
  )
  returning id into v_item_id;

  return v_item_id;
end;
$$;

-- Function to reorder list items
create or replace function reorder_list_items(
  p_list_id uuid,
  p_item_orders jsonb -- Array of {id: uuid, display_order: integer}
) returns void language plpgsql security definer as $$
begin
  -- Check if user owns the list
  if not exists (
    select 1 from public.lists
    where id = p_list_id
    and owner_id = auth.uid()
  ) then
    raise exception 'Not authorized to modify this list';
  end if;

  -- Update orders
  with new_orders as (
    select 
      (value->>'id')::uuid as item_id,
      (value->>'display_order')::integer as new_order
    from jsonb_array_elements(p_item_orders)
  )
  update public.list_items li
  set display_order = no.new_order
  from new_orders no
  where li.id = no.item_id
  and li.list_id = p_list_id;
end;
$$;

-- Function to get list items with race details
create or replace function get_list_items(
  p_list_id uuid
) returns table (
  id uuid,
  list_id uuid,
  race_id integer,
  note text,
  display_order integer,
  created_at timestamptz,
  updated_at timestamptz,
  race_name text,
  race_date date,
  circuit_name text
) language plpgsql security definer as $$
begin
  -- Check if user can access the list
  if not exists (
    select 1 from public.lists
    where id = p_list_id
    and (is_public = true or owner_id = auth.uid())
  ) then
    raise exception 'Not authorized to view this list';
  end if;

  return query
  select 
    li.id,
    li.list_id,
    li.race_id,
    li.note,
    li.display_order,
    li.created_at,
    li.updated_at,
    m.title as race_name,
    m.date as race_date,
    m.circuit_name
  from public.list_items li
  join public.matches m on m.id = li.race_id
  where li.list_id = p_list_id
  order by li.display_order;
end;
$$;

-- Recreate user_profiles view
create or replace view public.user_profiles as
select 
  u.id,
  u.username,
  u.avatar_url,
  u.created_at,
  u.updated_at,
  (
    select count(*)::integer
    from public.logs l
    where l.user_id = u.id
  ) as total_logs,
  (
    select count(*)::integer
    from public.lists l
    where l.owner_id = u.id
    and l.is_public = true
  ) as total_public_lists
from public.users u;

-- Grant necessary permissions
grant all on public.list_items to authenticated;
grant execute on function add_race_to_list to authenticated;
grant execute on function reorder_list_items to authenticated;
grant execute on function get_list_items to authenticated;
grant select on public.user_profiles to authenticated, anon; 