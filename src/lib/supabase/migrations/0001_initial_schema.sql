/* Enable UUID generation */
create extension if not exists "uuid-ossp";

/* Define sport types enum */
create type sport_type as enum ('f1', 'soccer', 'tennis', 'basketball', 'golf');

/* Users table - stores user profiles and authentication data */
create table public.users (
  id uuid primary key default uuid_generate_v4(),
  username text not null unique,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.users is 'User profiles for the application with authentication data';

/* Matches table - stores sports events/matches data */
create table public.matches (
  id bigint generated always as identity primary key,
  sport sport_type not null,
  ext_id text not null unique,
  title text not null,
  starts_at timestamptz not null,
  meta jsonb not null default '{}'::jsonb,
  poster_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.matches is 'Sports events/matches across different sports, starting with F1 races';

/* Logs table - stores user interactions with matches (ratings, reviews) */
create table public.logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  match_id bigint not null references public.matches(id) on delete cascade,
  rating decimal(2,1) check (rating >= 0 and rating <= 5),
  blurb text,
  is_rewatch boolean not null default false,
  watched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, match_id)
);
comment on table public.logs is 'User logs for watched matches including ratings and reviews';

/* Follows table - stores user follow relationships */
create table public.follows (
  follower_id uuid not null references public.users(id) on delete cascade,
  followee_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id)
);
comment on table public.follows is 'User follow relationships for social features';

/* Lists table - stores user-created lists of matches */
create table public.lists (
  id bigint generated always as identity primary key,
  owner_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.lists is 'User-created lists of matches, can be public or private';

/* List items table - stores matches within lists */
create table public.list_items (
  list_id bigint not null references public.lists(id) on delete cascade,
  match_id bigint not null references public.matches(id) on delete cascade,
  position int not null,
  created_at timestamptz not null default now(),
  primary key (list_id, match_id)
);
comment on table public.list_items is 'Individual items within user-created lists, with position for ordering';

/* Create indexes for performance optimization */
create index idx_matches_sport on public.matches(sport);
create index idx_matches_starts_at on public.matches(starts_at);
create index idx_logs_user_id on public.logs(user_id);
create index idx_logs_match_id on public.logs(match_id);
create index idx_logs_watched_at on public.logs(watched_at);
create index idx_lists_owner_id on public.lists(owner_id);
create index idx_list_items_position on public.list_items(position);

/* Create updated_at trigger function */
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

/* Create updated_at triggers for relevant tables */
create trigger update_users_updated_at
  before update on public.users
  for each row
  execute function update_updated_at_column();

create trigger update_matches_updated_at
  before update on public.matches
  for each row
  execute function update_updated_at_column();

create trigger update_logs_updated_at
  before update on public.logs
  for each row
  execute function update_updated_at_column();

create trigger update_lists_updated_at
  before update on public.lists
  for each row
  execute function update_updated_at_column();

/* Enable Row Level Security (RLS) */
alter table public.users enable row level security;
alter table public.matches enable row level security;
alter table public.logs enable row level security;
alter table public.follows enable row level security;
alter table public.lists enable row level security;
alter table public.list_items enable row level security;

/* Create RLS policies */
create policy "Users can read all users"
  on public.users for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.users for update
  to authenticated
  using (auth.uid() = id);

create policy "Anyone can read public matches"
  on public.matches for select
  to authenticated
  using (true);

create policy "Users can read their own logs"
  on public.logs for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own logs"
  on public.logs for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own logs"
  on public.logs for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their own logs"
  on public.logs for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can read follows"
  on public.follows for select
  to authenticated
  using (true);

create policy "Users can manage their own follows"
  on public.follows for all
  to authenticated
  using (auth.uid() = follower_id);

create policy "Users can read public lists"
  on public.lists for select
  to authenticated
  using (is_public = true or owner_id = auth.uid());

create policy "Users can manage their own lists"
  on public.lists for all
  to authenticated
  using (owner_id = auth.uid());

create policy "Users can read list items of public lists"
  on public.list_items for select
  to authenticated
  using (
    exists (
      select 1 
      from public.lists
      where id = list_id 
      and (is_public = true or owner_id = auth.uid())
    )
  );

create policy "Users can manage their own list items"
  on public.list_items for all
  to authenticated
  using (
    exists (
      select 1 
      from public.lists
      where id = list_id 
      and owner_id = auth.uid()
    )
  ); 