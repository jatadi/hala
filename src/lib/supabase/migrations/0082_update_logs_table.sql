-- Grant update permissions to authenticated users
grant update (rating, review, watched_at) on public.logs to authenticated; 