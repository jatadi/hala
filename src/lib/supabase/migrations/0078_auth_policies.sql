/* Enable RLS on users table if not already enabled */
alter table public.users enable row level security;

/* Drop existing policies */
drop policy if exists "Anyone can read users" on public.users;
drop policy if exists "Users can insert their own profile" on public.users;
drop policy if exists "Users can update their own profile" on public.users;

/* Create new policies */
create policy "Anyone can read users"
  on public.users for select
  using (true);

create policy "Users can insert their own profile"
  on public.users for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

/* Add email column if not exists */
alter table public.users
add column if not exists email text; 