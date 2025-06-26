-- First drop the dependent view
drop view if exists public.user_profiles;

-- Then recreate the follows table
drop table if exists public.follows;

create table public.follows (
    follower_id uuid references public.users(id) on delete cascade,
    following_id uuid references public.users(id) on delete cascade,
    created_at timestamptz default now(),
    primary key (follower_id, following_id)
);

-- Add RLS policies
alter table public.follows enable row level security;

-- Users can see all follows (needed for follower/following lists)
create policy "Anyone can view follows"
    on public.follows
    for select
    to authenticated
    using (true);

-- Users can only follow/unfollow themselves
create policy "Users can only follow/unfollow as themselves"
    on public.follows
    for insert
    to authenticated
    with check (auth.uid() = follower_id);

create policy "Users can only unfollow themselves"
    on public.follows
    for delete
    to authenticated
    using (auth.uid() = follower_id);

-- Create indexes for performance
create index if not exists follows_follower_id_idx on public.follows(follower_id);
create index if not exists follows_following_id_idx on public.follows(following_id);

-- Create functions for follower/following operations
create or replace function public.get_user_followers(user_id uuid)
returns setof public.users
language sql
security definer
set search_path = public
stable
as $$
    select u.*
    from public.users u
    inner join public.follows f on f.follower_id = u.id
    where f.following_id = user_id
    order by f.created_at desc;
$$;

create or replace function public.get_user_following(user_id uuid)
returns setof public.users
language sql
security definer
set search_path = public
stable
as $$
    select u.*
    from public.users u
    inner join public.follows f on f.following_id = u.id
    where f.follower_id = user_id
    order by f.created_at desc;
$$;

create or replace function public.check_is_following(follower_id uuid, following_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
    select exists (
        select 1
        from public.follows
        where follower_id = check_is_following.follower_id
        and following_id = check_is_following.following_id
    );
$$;

-- Grant necessary permissions
grant execute on function public.get_user_followers(uuid) to authenticated;
grant execute on function public.get_user_following(uuid) to authenticated;
grant execute on function public.check_is_following(uuid, uuid) to authenticated;

 