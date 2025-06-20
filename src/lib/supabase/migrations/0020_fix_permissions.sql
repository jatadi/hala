-- Grant additional permissions that might be needed
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant execute on all functions in schema public to anon, authenticated;

-- Refresh the RLS policies
alter table public.logs disable row level security;
alter table public.logs enable row level security;

alter table public.matches disable row level security;
alter table public.matches enable row level security; 