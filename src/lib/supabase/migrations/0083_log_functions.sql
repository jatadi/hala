-- Function to log a race watch
create or replace function log_race_watch(
  user_id_param uuid,
  race_id_param bigint,
  rating_param decimal(2,1) default null,
  review_param text default null
) returns json language plpgsql security definer as $$
declare
  log_record record;
begin
  -- Insert or update the log
  insert into public.logs (
    user_id,
    match_id,
    rating,
    review,
    watched_at
  ) values (
    user_id_param,
    race_id_param,
    rating_param,
    review_param,
    now()  -- Set watched_at only on initial insert
  )
  on conflict (user_id, match_id) do update
  set
    rating = EXCLUDED.rating,
    review = EXCLUDED.review,
    updated_at = now()  -- Only update the updated_at timestamp
  returning * into log_record;

  return json_build_object(
    'id', log_record.id,
    'user_id', log_record.user_id,
    'match_id', log_record.match_id,
    'rating', log_record.rating,
    'review', log_record.review,
    'watched_at', log_record.watched_at,
    'created_at', log_record.created_at,
    'updated_at', log_record.updated_at
  );
end;
$$;

-- Function to get all logs for a race
create or replace function get_race_logs(
  race_id_param bigint
) returns table (
  log_id bigint,
  user_id uuid,
  username text,
  avatar_url text,
  rating decimal(2,1),
  review text,
  watched_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
) language sql stable as $$
  select
    l.id as log_id,
    l.user_id,
    u.username,
    u.avatar_url,
    l.rating,
    l.review,
    l.watched_at,
    l.created_at,
    l.updated_at
  from public.logs l
  join public.users u on u.id = l.user_id
  where l.match_id = race_id_param
  order by l.watched_at desc;
$$;

-- Function to get a specific user's log for a race
create or replace function get_user_race_log(
  user_id_param uuid,
  race_id_param bigint
) returns table (
  log_id bigint,
  rating decimal(2,1),
  review text,
  watched_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  race_name text,
  race_date timestamptz
) language sql stable as $$
  select
    l.id as log_id,
    l.rating,
    l.review,
    l.watched_at,
    l.created_at,
    l.updated_at,
    m.title as race_name,
    m.starts_at as race_date
  from public.logs l
  join public.matches m on m.id = l.match_id
  where l.user_id = user_id_param
  and l.match_id = race_id_param;
$$;

-- Grant execute permissions to authenticated users
grant execute on function log_race_watch(uuid, bigint, decimal, text) to authenticated;
grant execute on function get_race_logs(bigint) to authenticated;
grant execute on function get_user_race_log(uuid, bigint) to authenticated; 