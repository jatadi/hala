-- Create function to get filtered activities for a user
create or replace function public.get_filtered_activities(
  user_id_param uuid,
  source text default 'all', -- 'all', 'you', or 'following'
  limit_param integer default 20,
  offset_param integer default 0
) returns table (
  type text,
  activity_id text,
  user_id uuid,
  race_id bigint,
  created_at timestamptz,
  rating numeric,
  review text,
  username text,
  avatar_url text,
  race_name text,
  circuit text,
  country text,
  target_user_id uuid,
  target_username text
) language sql security definer as $$
  select *
  from public.activities
  where 
    case source
      -- Only user's own activities
      when 'you' then user_id = user_id_param
      -- Only activities from followed users
      when 'following' then user_id in (
        select following_id 
        from public.follows 
        where follower_id = user_id_param
      )
      -- All activities (user's own + followed users)
      else (
        user_id = user_id_param
        or user_id in (
          select following_id 
          from public.follows 
          where follower_id = user_id_param
        )
      )
    end
  order by created_at desc
  limit limit_param
  offset offset_param;
$$;

-- Grant necessary permissions
grant execute on function public.get_filtered_activities to authenticated, anon; 