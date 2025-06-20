-- Drop existing policies
drop policy if exists "Public read access for logs" on public.logs;
drop policy if exists "Public read access for F1 races" on public.matches;

-- Create more specific policies
create policy "Anyone can read logs"
  on public.logs
  for select
  using (true);

create policy "Anyone can read F1 races"
  on public.matches
  for select
  using (sport = 'f1');

-- Ensure RLS is enabled
alter table public.logs enable row level security;
alter table public.matches enable row level security;

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant select on public.logs to anon, authenticated;
grant select on public.matches to anon, authenticated;
grant select on public.users to anon, authenticated;

-- Verify the function permissions
grant execute on function get_race_details(bigint) to anon, authenticated;
grant execute on function get_race_watchers(bigint) to anon, authenticated; 