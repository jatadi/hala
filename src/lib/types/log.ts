export interface RaceLog {
  id: number;
  user_id: string;
  match_id: number;
  rating: number | null;
  review: string | null;
  watched_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRaceLogInput {
  match_id: number;
  rating?: number;
  review?: string;
  watched_at?: string;
} 