import { supabase } from '../client';
import type { Log, LogUpdate } from '@/lib/types/log';

export interface RaceLogOptions {
  rating?: number | null;
  review?: string | null;
}

/**
 * Log a race watch or update existing log
 */
export async function logRaceWatch(
  userId: string,
  raceId: number,
  options?: RaceLogOptions
): Promise<Log> {
  const { data, error } = await supabase
    .rpc('log_race_watch', {
      user_id_param: userId,
      race_id_param: raceId,
      rating_param: options?.rating,
      review_param: options?.review
    });

  if (error) throw error;
  return data;
}

/**
 * Update an existing race log
 */
export async function updateRaceLog(
  userId: string,
  raceId: number,
  updates: LogUpdate
): Promise<Log> {
  // We can reuse log_race_watch since it handles upserts
  const { data, error } = await supabase
    .rpc('log_race_watch', {
      user_id_param: userId,
      race_id_param: raceId,
      rating_param: updates.rating,
      review_param: updates.review
    });

  if (error) throw error;
  return data;
}

export interface RaceLog {
  log_id: number;
  user_id: string;
  username: string;
  avatar_url: string | null;
  rating: number | null;
  review: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Get all logs for a specific race
 */
export async function getRaceLogs(raceId: number): Promise<RaceLog[]> {
  const { data, error } = await supabase
    .rpc('get_race_logs', { race_id_param: raceId });

  if (error) throw error;
  return data || [];
}

export interface UserRaceLog {
  id: number;
  user_id: string;
  race_id: number;
  rating: number;
  review: string | null;
  created_at: string;
  updated_at: string;
  race_name: string;
  circuit: string;
  country: string;
}

/**
 * Get a specific user's log for a race
 */
export async function getUserRaceLog(
  userId: string,
  raceId: number
): Promise<UserRaceLog | null> {
  const { data, error } = await supabase
    .from('race_logs_detailed')
    .select('*')
    .eq('user_id', userId)
    .eq('race_id', raceId)
    .single();

  if (error) {
    console.error('Error fetching user race log:', error);
    return null;
  }

  return data;
}

/**
 * Delete a race log
 */
export async function deleteRaceLog(
  userId: string,
  matchId: number
): Promise<void> {
  const { error } = await supabase
    .from('logs')
    .delete()
    .eq('user_id', userId)
    .eq('match_id', matchId);

  if (error) throw error;
}

export async function getUserRecentLogs(userId: string, limit = 5): Promise<UserRaceLog[]> {
  const { data, error } = await supabase
    .from('race_logs_detailed')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching user recent logs:', error);
    throw error;
  }

  return data || [];
} 