-- Create list_likes table
create table public.list_likes (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references public.lists(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(list_id, user_id)
);

-- Enable RLS on list_likes
alter table public.list_likes enable row level security;

-- Create list_comments table
create table public.list_comments (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references public.lists(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add trigger for updated_at on comments
create trigger update_list_comments_updated_at
  before update on public.list_comments
  for each row
  execute function update_updated_at_column();

-- Enable RLS on list_comments
alter table public.list_comments enable row level security;

-- RLS Policies

-- Anyone can read likes on public lists
create policy "Anyone can read likes on public lists"
  on public.list_likes
  for select
  using (
    exists (
      select 1 from public.lists l
      where l.id = list_likes.list_id
      and (l.is_public = true or l.owner_id = auth.uid())
    )
  );

-- Users can like/unlike
create policy "Users can like/unlike"
  on public.list_likes
  for all
  using (
    exists (
      select 1 from public.lists l
      where l.id = list_likes.list_id
      and (l.is_public = true or l.owner_id = auth.uid())
    )
    and auth.uid() = user_id
  );

-- Anyone can read comments on public lists
create policy "Anyone can read comments on public lists"
  on public.list_comments
  for select
  using (
    exists (
      select 1 from public.lists l
      where l.id = list_comments.list_id
      and (l.is_public = true or l.owner_id = auth.uid())
    )
  );

-- Users can manage their own comments
create policy "Users can manage their own comments"
  on public.list_comments
  for all
  using (auth.uid() = user_id);

-- Helper Functions

-- Function to like/unlike a list
create or replace function toggle_list_like(
  p_list_id uuid
) returns boolean language plpgsql security definer as $$
declare
  v_liked boolean;
begin
  -- Check if list exists and is accessible
  if not exists (
    select 1 from public.lists
    where id = p_list_id
    and (is_public = true or owner_id = auth.uid())
  ) then
    raise exception 'List not found or not accessible';
  end if;

  -- Try to delete existing like
  delete from public.list_likes
  where list_id = p_list_id
  and user_id = auth.uid()
  returning true into v_liked;

  -- If no like was deleted, create one
  if v_liked is null then
    insert into public.list_likes (list_id, user_id)
    values (p_list_id, auth.uid());
    return true;
  end if;

  return false;
end;
$$;

-- Function to get list details with social counts
create or replace function get_list_details(
  p_list_id uuid
) returns table (
  id uuid,
  owner_id uuid,
  title text,
  description text,
  is_public boolean,
  created_at timestamptz,
  updated_at timestamptz,
  race_count bigint,
  like_count bigint,
  comment_count bigint,
  is_liked boolean
) language plpgsql security definer as $$
begin
  -- Check if list is accessible
  if not exists (
    select 1 from public.lists
    where id = p_list_id
    and (is_public = true or owner_id = auth.uid())
  ) then
    raise exception 'List not found or not accessible';
  end if;

  return query
  select 
    l.id,
    l.owner_id,
    l.title,
    l.description,
    l.is_public,
    l.created_at,
    l.updated_at,
    count(distinct li.id)::bigint as race_count,
    count(distinct lk.id)::bigint as like_count,
    count(distinct c.id)::bigint as comment_count,
    exists (
      select 1 from public.list_likes ul
      where ul.list_id = l.id
      and ul.user_id = auth.uid()
    ) as is_liked
  from public.lists l
  left join public.list_items li on li.list_id = l.id
  left join public.list_likes lk on lk.list_id = l.id
  left join public.list_comments c on c.list_id = l.id
  where l.id = p_list_id
  group by l.id, l.owner_id, l.title, l.description, l.is_public, l.created_at, l.updated_at;
end;
$$;

-- Grant necessary permissions
grant all on public.list_likes to authenticated;
grant all on public.list_comments to authenticated;
grant execute on function toggle_list_like to authenticated;
grant execute on function get_list_details to authenticated; 