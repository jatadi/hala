-- Create notification types enum
create type public.notification_type as enum (
  'follow',              -- Someone followed you
  'review_like',         -- Someone liked your review
  'friend_review_race'   -- Someone you follow reviewed the same race as you
);

-- Create notifications table
create table public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  type notification_type not null,
  actor_id uuid references public.users(id) on delete cascade,  -- Who triggered the notification
  race_id bigint references public.matches(id) on delete cascade,
  review_id bigint references public.logs(id) on delete cascade, -- Reference to the review/log
  created_at timestamptz not null default now(),
  read_at timestamptz,
  data jsonb -- Additional context data
);

comment on table public.notifications is 'Stores user notifications for follows, review likes, and friend reviews';

-- Add indexes
create index notifications_user_id_idx on public.notifications(user_id);
create index notifications_created_at_idx on public.notifications(created_at);
create index notifications_read_at_idx on public.notifications(read_at);

-- Add RLS policies
alter table public.notifications enable row level security;

-- Users can only see their own notifications
create policy "Users can view their own notifications"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

-- Function to create a notification
create or replace function public.create_notification(
  user_id_param uuid,
  type_param notification_type,
  actor_id_param uuid,
  race_id_param bigint default null,
  review_id_param bigint default null,
  data_param jsonb default '{}'::jsonb
) returns void language plpgsql security definer as $$
begin
  -- Don't notify users about their own actions
  if user_id_param = actor_id_param then
    return;
  end if;

  insert into public.notifications (
    user_id,
    type,
    actor_id,
    race_id,
    review_id,
    data
  ) values (
    user_id_param,
    type_param,
    actor_id_param,
    race_id_param,
    review_id_param,
    data_param
  );
end;
$$;

-- Trigger for follow notifications
create or replace function public.notify_on_follow()
returns trigger language plpgsql security definer as $$
begin
  perform create_notification(
    new.following_id,  -- Notify the person being followed
    'follow',
    new.follower_id,
    null,
    null,
    jsonb_build_object(
      'follower_username', (select username from public.users where id = new.follower_id)
    )
  );
  return new;
end;
$$;

create trigger notify_follow_insert
after insert on public.follows
for each row
execute function notify_on_follow();

-- Trigger for friend review notifications
create or replace function public.notify_on_friend_review()
returns trigger language plpgsql security definer as $$
declare
  follower_ids uuid[];
  follower_id uuid;
begin
  -- Get all users who:
  -- 1. Follow the person who just reviewed
  -- 2. Have also reviewed this race
  -- This ensures we only notify people who:
  -- a) Follow the reviewer
  -- b) Have already reviewed the race themselves
  select array_agg(distinct follows.follower_id)
  into follower_ids
  from public.follows
  join public.logs on logs.user_id = follows.follower_id
  where follows.following_id = new.user_id
    and logs.match_id = new.match_id
    and logs.user_id != new.user_id
    and logs.created_at < new.created_at;  -- Only notify about reviews that came after their own

  -- Notify each follower who has reviewed this race
  if follower_ids is not null then
    foreach follower_id in array follower_ids
    loop
      perform create_notification(
        follower_id,
        'friend_review_race',
        new.user_id,
        new.match_id,
        new.id,
        jsonb_build_object(
          'username', (select username from public.users where id = new.user_id),
          'race_name', (select race_name from public.f1_races where race_id = new.match_id)
        )
      );
    end loop;
  end if;
  
  return new;
end;
$$;

create trigger notify_friend_review_insert
after insert on public.logs
for each row
execute function notify_on_friend_review();

-- Function to mark notifications as read
create or replace function public.mark_notifications_read(
  notification_ids bigint[]
)
returns void language plpgsql security definer as $$
begin
  update public.notifications
  set read_at = now()
  where id = any(notification_ids)
    and user_id = auth.uid()
    and read_at is null;
end;
$$;

-- Grant necessary permissions
grant execute on function public.create_notification to authenticated;
grant execute on function public.mark_notifications_read to authenticated; 