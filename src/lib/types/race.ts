import type { Database } from './database';

export interface RaceDetails {
  race_id: number;
  race_name: string;
  year: number;
  race_date: string;
  poster_url: string | null;
  circuit: string;
  winner: string | null;
  country: string;
  average_rating: number | null;
  watchers_count: number;
  is_past_race: boolean;
  round: number;
}

export interface RaceWatcher {
  user_id: string;
  username: string;
  avatar_url: string | null;
  watched_at: string;
  rating: number | null;
  review: string | null;
}

export interface Race {
  id: string;
  name: string;
  date: string;
  circuit_name: string;
  circuit_location: string;
  circuit_country: string;
  poster_url: string | null;
  season: number;
  round: number;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export type Races = Database['public']['Tables']['races']['Row'];
export type RaceUpdate = Database['public']['Tables']['races']['Update']; 