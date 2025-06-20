-- First, drop all existing policies to start fresh
drop policy if exists "Public read access for logs" on public.logs;
drop policy if exists "Public read access for F1 races" on public.matches;
drop policy if exists "Anyone can read logs" on public.logs;
drop policy if exists "Anyone can read F1 races" on public.matches;

-- Enable RLS on all tables
alter table public.matches enable row level security;
alter table public.logs enable row level security;
alter table public.users enable row level security;

-- Create policies
create policy "Anyone can read F1 races"
  on public.matches
  for select
  using (sport = 'f1');

create policy "Anyone can read logs"
  on public.logs
  for select
  using (true);

create policy "Anyone can read user profiles"
  on public.users
  for select
  using (true);

-- Grant basic permissions
grant usage on schema public to anon, authenticated;

-- Grant table permissions
grant select on public.matches to anon, authenticated;
grant select on public.logs to anon, authenticated;
grant select on public.users to anon, authenticated;

-- Grant function permissions
grant execute on function get_race_details(bigint) to anon, authenticated;
grant execute on function get_race_watchers(bigint) to anon, authenticated;

-- Verify the setup by checking race 5 again
select * from get_race_details(5); 