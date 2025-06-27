-- Check if notifications table exists and has the right structure
select exists (
  select from information_schema.tables 
  where table_schema = 'public' 
  and table_name = 'notifications'
) as notifications_table_exists;

-- Check if the notification_type enum exists
select exists (
  select from pg_type 
  where typname = 'notification_type'
) as notification_type_exists;

-- Check if the trigger exists
select exists (
  select from pg_trigger 
  where tgname = 'notify_follow_insert'
) as trigger_exists;

-- Check existing notifications
select 
  n.*,
  u1.username as notified_user,
  u2.username as actor_username
from public.notifications n
left join public.users u1 on n.user_id = u1.id
left join public.users u2 on n.actor_id = u2.id
order by n.created_at desc;

-- Check the follow relationship
select 
  f.*,
  u1.username as follower_username,
  u2.username as following_username
from public.follows f
join public.users u1 on f.follower_id = u1.id
join public.users u2 on f.following_id = u2.id
where u1.username = 'maxv'
  and u2.username = 'tadijaciric'; 