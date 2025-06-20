-- Enable RLS on matches table if not already enabled
alter table public.matches enable row level security;

-- Create policy for public read access to F1 races
create policy "Public read access for F1 races"
  on public.matches
  for select
  using (sport = 'f1');

-- Grant access to authenticated and anon users
grant select on public.matches to authenticated, anon;

-- Also grant execute on the functions to authenticated and anon users
grant execute on function get_race_details(bigint) to authenticated, anon;
grant execute on function get_race_watchers(bigint) to authenticated, anon; 