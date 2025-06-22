export interface F1Race {
  race_id: number;
  race_name: string;
  year: number;
  race_date: string;
  poster_url: string;
  circuit: string;
  winner: string | null;
  country: string;
  round: number;
  created_at: string;
  updated_at: string;
} 