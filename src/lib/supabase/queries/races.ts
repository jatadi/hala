import { supabase } from '../client';
import type { F1Race } from '@/lib/types/f1';
import type { RaceDetails, RaceWatcher } from '@/lib/types/race';

/**
 * Database field names in snake_case to match PostgreSQL conventions
 */
const F1_RACE_FIELDS = `
  race_id,
  race_name,
  year,
  race_date,
  poster_url,
  circuit,
  winner,
  location,
  country,
  created_at,
  updated_at
`;

export async function getAllF1Races(): Promise<F1Race[]> {
  const { data, error } = await supabase
    .from('f1_races')
    .select('*')
    .order('race_date', { ascending: false });

  if (error) {
    console.error('Error fetching races:', error);
    return [];
  }

  return data || [];
}

export async function getUpcomingF1Races(): Promise<F1Race[]> {
  const { data, error } = await supabase
    .from('f1_races')
    .select(F1_RACE_FIELDS)
    .gt('race_date', new Date().toISOString())
    .order('race_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getPastF1Races(): Promise<F1Race[]> {
  const { data, error } = await supabase
    .from('f1_races')
    .select(F1_RACE_FIELDS)
    .lte('race_date', new Date().toISOString())
    .order('race_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getF1RacesByYear(year: number): Promise<F1Race[]> {
  const { data, error } = await supabase
    .from('f1_races')
    .select(F1_RACE_FIELDS)
    .eq('year', year)
    .order('race_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Gets detailed information about a specific race
 * @param raceId - The race ID in camelCase (TypeScript convention)
 * @returns Race details with snake_case fields (API convention)
 */
export async function getRaceDetails(raceId: number): Promise<RaceDetails | null> {
  // Input validation
  if (!raceId || isNaN(raceId) || raceId < 1) {
    console.error('Invalid race ID:', raceId);
    return null;
  }

  console.log('Fetching race details for ID:', raceId);
  
  type RaceDetailsResponse = {
    race_id: string | number;
    year: string | number;
    race_name: string;
    race_date: string;
    poster_url: string;
    circuit: string;
    winner: string | null;
    location: string;
    country: string;
    average_rating: string | number | null;
    watchers_count: string | number;
    is_past_race: boolean;
  };

  try {
    const { data, error } = await supabase
      .rpc('get_race_details', { race_id_param: raceId })
      .maybeSingle();

    if (error) {
      console.error('Error fetching race details:', error.message);
      return null;
    }

    if (!data) {
      console.log('No race found with ID:', raceId);
      return null;
    }

    // Log raw data from database
    console.log('Raw data from DB:', data);

    // Type guard to ensure all required fields are present
    const requiredFields = [
      'race_id', 'year', 'race_name', 'race_date', 'poster_url',
      'circuit', 'location', 'country'
    ] as const;

    const dataRecord = data as Record<string, unknown>;
    const missingFields = requiredFields.filter(field => !(field in dataRecord));
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return null;
    }

    // Cast and normalize numeric values with safety checks
    const rawData = data as RaceDetailsResponse;
    const processedDetails: RaceDetails = {
      race_id: Number(rawData.race_id),
      year: Number(rawData.year),
      race_name: String(rawData.race_name),
      race_date: String(rawData.race_date),
      poster_url: String(rawData.poster_url),
      circuit: String(rawData.circuit),
      winner: rawData.winner ? String(rawData.winner) : null,
      location: String(rawData.location),
      country: String(rawData.country),
      average_rating: rawData.average_rating !== null && !isNaN(Number(rawData.average_rating))
        ? Number(rawData.average_rating)
        : null,
      watchers_count: !isNaN(Number(rawData.watchers_count))
        ? Number(rawData.watchers_count)
        : 0,
      is_past_race: Boolean(rawData.is_past_race)
    };

    // Validate processed data
    if (isNaN(processedDetails.race_id) || isNaN(processedDetails.year)) {
      console.error('Invalid numeric values after processing:', { 
        race_id: rawData.race_id, 
        year: rawData.year 
      });
      return null;
    }

    // Log processed data
    console.log('Processed race details:', processedDetails);

    return processedDetails;
  } catch (err) {
    console.error('Unexpected error in getRaceDetails:', err);
    return null;
  }
}

/**
 * Gets the list of users who have watched a race
 * @param raceId - The race ID in camelCase (TypeScript convention)
 * @returns Array of watchers with snake_case fields (API convention)
 */
export async function getRaceWatchers(raceId: number): Promise<RaceWatcher[]> {
  // Input validation
  if (!raceId || isNaN(raceId) || raceId < 1) {
    console.error('Invalid race ID:', raceId);
    return [];
  }

  console.log('Fetching watchers for race ID:', raceId);
  
  try {
    // Get the watchers directly
    console.log('Calling get_race_watchers RPC with:', { race_id_param: raceId });
    const { data, error } = await supabase
      .rpc('get_race_watchers', { race_id_param: raceId });

    if (error) {
      console.error('Error fetching race watchers:', error.message);
      return [];
    }

    if (!data || !Array.isArray(data)) {
      console.log('No watchers data returned for race ID:', raceId);
      return [];
    }

    // Log raw data for debugging
    console.log('Raw watchers data:', {
      count: data.length,
      watchers: data,
      raceId
    });

    // Verify each watcher has required fields
    const validWatchers = data.filter(watcher => {
      const hasRequiredFields = 
        'user_id' in watcher &&
        'username' in watcher &&
        'watched_at' in watcher;
      
      if (!hasRequiredFields) {
        console.error('Invalid watcher data:', watcher);
      }
      
      return hasRequiredFields;
    });

    console.log('Processed watchers:', {
      originalCount: data.length,
      validCount: validWatchers.length,
      sample: validWatchers[0]
    });

    return validWatchers;
  } catch (err) {
    console.error('Unexpected error in getRaceWatchers:', err);
    return [];
  }
} 