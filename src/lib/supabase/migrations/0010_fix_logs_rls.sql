/* Drop existing policies on logs */
drop policy if exists "Users can read their own logs" on public.logs;
drop policy if exists "Anyone can read logs" on public.logs;

/* Create new policy to allow public read access to logs */
create policy "Anyone can read logs"
  on public.logs for select
  using (true);

/* Verify logs are accessible */
select 
  l.*,
  u.username,
  m.title as race_name
from public.logs l
join public.users u on u.id = l.user_id
join public.matches m on m.id = l.match_id
where u.username = 'maxv';

/* Double check the user_profiles view */
select 
  username,
  races_watched,
  races_rated,
  races_reviewed,
  average_rating
from public.user_profiles
where username = 'maxv'; 