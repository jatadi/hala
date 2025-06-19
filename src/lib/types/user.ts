export interface UserProfile {
  id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  // Stats
  races_watched: number;
  races_rated: number;
  races_reviewed: number;
  average_rating: number | null;
  last_watched_at: string | null;
  number_of_lists: number;
  following_count: number;
  followers_count: number;
}

export interface UserStat {
  stat_name: string;
  stat_value: string;
} 