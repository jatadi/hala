export interface F1Race {
  race_id: number;
  race_name: string;      // matches.title
  year: number;          // extracted from matches.starts_at
  race_date: string;     // matches.starts_at
  poster_url: string | null;
  circuit: string;       // from matches.meta
  winner: string | null; // from matches.meta
  location: string;      // from matches.meta
  country: string;       // from matches.meta
  created_at: string;
  updated_at: string;
}

// This interface represents the structure of the meta JSONB field in matches table
export interface F1RaceMeta {
  circuit: string;
  winner: string | null;
  location: string;
  country: string;
} 