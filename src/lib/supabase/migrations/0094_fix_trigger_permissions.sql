-- Grant execute permissions on the trigger functions
grant execute on function public.notify_on_follow to authenticated;
grant execute on function public.notify_on_friend_review to authenticated;

-- Make the functions stable to avoid permission issues
alter function public.notify_on_follow stable;
alter function public.notify_on_friend_review stable;

-- Make sure the functions are security definer
alter function public.notify_on_follow security definer;
alter function public.notify_on_friend_review security definer;

-- Verify the notifications table permissions
grant select on public.notifications to authenticated;

-- Re-enable the trigger to make sure it's active
alter table public.follows enable trigger notify_follow_insert; 