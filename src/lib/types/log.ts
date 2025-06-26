export interface RaceLog {
  id: number;
  user_id: string;
  race_id: number;
  rating: number;
  review: string | null;
  created_at: string;
  updated_at: string;
}

export interface RaceLogInput {
  rating: number;
  review?: string | null;
}

export type Log = {
  id: string;
  user_id: string;
  match_id: string;
  rating: number | null; // 1-5
  review: string | null;
  created_at: string;
  updated_at: string;
};

export type LogUpdate = {
  rating?: number | null;
  review?: string | null;
}; 