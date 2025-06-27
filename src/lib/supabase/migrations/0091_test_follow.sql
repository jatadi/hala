-- Get the user IDs first to verify they exist
do $$ 
declare
  maxv_id uuid;
  tadija_id uuid;
begin
  -- Get maxv's ID
  select id into maxv_id
  from public.users
  where username = 'maxv';

  -- Get tadijaciric's ID
  select id into tadija_id
  from public.users
  where username = 'tadijaciric';

  -- Verify both users exist
  if maxv_id is null then
    raise exception 'User maxv not found';
  end if;

  if tadija_id is null then
    raise exception 'User tadijaciric not found';
  end if;

  -- Create the follow relationship
  insert into public.follows (follower_id, following_id)
  values (maxv_id, tadija_id);

end $$; 