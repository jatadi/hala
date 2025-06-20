-- Enable RLS on logs table
alter table public.logs enable row level security;

-- Create policy for public read access to logs
create policy "Public read access for logs"
  on public.logs
  for select
  using (true);  -- Everyone can read logs

-- Grant access to authenticated and anon users
grant select on public.logs to authenticated, anon; 