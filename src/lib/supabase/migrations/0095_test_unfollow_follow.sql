-- Get the user IDs first to verify they exist
do $$ 
declare
  lewish_id uuid;
  tadija_id uuid;
begin
  -- Get lewish's ID
  select id into lewish_id
  from public.users
  where username = 'lewish';

  -- Get tadijaciric's ID
  select id into tadija_id
  from public.users
  where username = 'tadijaciric';

  -- Verify both users exist
  if lewish_id is null then
    raise exception 'User lewish not found';
  end if;

  if tadija_id is null then
    raise exception 'User tadijaciric not found';
  end if;

  -- First, unfollow
  delete from public.follows 
  where follower_id = lewish_id 
    and following_id = tadija_id;

  -- Wait for 2 seconds to make the sequence of events clear
  perform pg_sleep(2);

  -- Then follow again
  insert into public.follows (follower_id, following_id)
  values (lewish_id, tadija_id);

end $$; 