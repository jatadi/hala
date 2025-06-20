export interface RaceDetails {
  race_id: number;
  race_name: string;
  year: number;
  race_date: string;
  poster_url: string | null;
  circuit: string;
  winner: string | null;
  location: string;
  country: string;
  average_rating: number | null;
  watchers_count: number;
  is_past_race: boolean;
}

export interface RaceWatcher {
  user_id: string;
  username: string;
  avatar_url: string | null;
  watched_at: string;
  rating: number | null;
  review: string | null;
} 