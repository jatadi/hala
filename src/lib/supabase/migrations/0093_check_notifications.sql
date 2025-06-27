-- Check if the trigger is properly installed on the follows table
select 
    t.tgname as trigger_name,
    p.proname as function_name,
    t.tgenabled as trigger_enabled
from pg_trigger t
join pg_proc p on t.tgfoid = p.oid
join pg_class c on t.tgrelid = c.oid
where c.relname = 'follows';

-- Check all notifications
select 
    n.*,
    u1.username as notified_user,
    u2.username as actor_username,
    n.data
from public.notifications n
left join public.users u1 on n.user_id = u1.id
left join public.users u2 on n.actor_id = u2.id;

-- Try to manually create a test notification
do $$ 
declare
    maxv_id uuid;
    tadija_id uuid;
begin
    -- Get the user IDs
    select id into maxv_id from public.users where username = 'maxv';
    select id into tadija_id from public.users where username = 'tadijaciric';
    
    -- Manually call create_notification
    perform public.create_notification(
        tadija_id,  -- notify tadijaciric
        'follow'::notification_type,
        maxv_id,    -- maxv is the actor
        null,
        null,
        jsonb_build_object(
            'follower_username', 'maxv'
        )
    );
end $$; 