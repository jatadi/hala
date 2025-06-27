export type ActivityType = 'log' | 'follow';

interface BaseActivity {
  type: ActivityType;
  activity_id: string;
  user_id: string;
  created_at: string;
  username: string;
  avatar_url: string | null;
}

export interface RaceLogActivity extends BaseActivity {
  type: 'log';
  race_id: number;
  rating: number | null;
  review: string | null;
  race_name: string;
  circuit: string;
  country: string;
  target_user_id: null;
  target_username: null;
}

export interface FollowActivity extends BaseActivity {
  type: 'follow';
  race_id: null;
  rating: null;
  review: null;
  race_name: null;
  circuit: null;
  country: null;
  target_user_id: string;
  target_username: string;
}

export type Activity = RaceLogActivity | FollowActivity;

export interface FeedOptions {
  limit?: number;
  offset?: number;
} 