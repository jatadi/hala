-- Drop the existing function
drop function if exists public.get_profile_stats;

-- Recreate the function with proper race existence check
create or replace function public.get_profile_stats(username_param text)
returns table (
  races_watched bigint,
  races_rated bigint,
  races_reviewed bigint,
  average_rating numeric,
  last_watched_at timestamptz,
  number_of_lists bigint,
  following_count bigint,
  followers_count bigint
) as $$
begin
  return query
  select
    count(distinct l.match_id)::bigint as races_watched,
    count(distinct case when l.rating is not null then l.match_id end)::bigint as races_rated,
    count(distinct case when l.review is not null then l.match_id end)::bigint as races_reviewed,
    round(avg(l.rating)::numeric, 2) as average_rating,
    max(l.watched_at) as last_watched_at,
    0::bigint as number_of_lists,
    0::bigint as following_count,
    0::bigint as followers_count
  from
    public.users u
    left join public.logs l on u.id = l.user_id
    -- Only count races that exist in f1_races table
    inner join public.f1_races r on l.match_id = r.race_id
  where
    u.username = username_param
  group by
    u.id;
end;
$$ language plpgsql security definer;

-- Test the function with our test users
select 'maxv stats:' as check;
select * from public.get_profile_stats('maxv');

select 'lewish stats:' as check;
select * from public.get_profile_stats('lewish'); 