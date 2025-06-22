-- Function to create F1 insert policy
create or replace function create_f1_insert_policy()
returns void
language plpgsql
security definer
as $$
begin
  -- Drop existing policy if it exists
  drop policy if exists "Allow F1 race inserts" on public.matches;
  
  -- Create new policy
  create policy "Allow F1 race inserts"
    on public.matches
    for insert
    with check (sport = 'f1');
end;
$$;

-- Function to grant insert permissions
create or replace function grant_matches_insert()
returns void
language plpgsql
security definer
as $$
begin
  -- Grant insert permission to authenticated users
  grant insert on public.matches to authenticated;
end;
$$;

-- Grant execute permissions on the functions
grant execute on function create_f1_insert_policy() to authenticated;
grant execute on function grant_matches_insert() to authenticated; 