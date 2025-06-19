import { supabase } from '../client';
import type { RaceLog, CreateRaceLogInput } from '@/lib/types/log';

export async function getUserRaceLogs(userId: string): Promise<RaceLog[]> {
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .eq('user_id', userId)
    .order('watched_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getRaceLog(userId: string, matchId: number): Promise<RaceLog | null> {
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .eq('user_id', userId)
    .eq('match_id', matchId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
  return data;
}

export async function createRaceLog(
  userId: string,
  input: CreateRaceLogInput
): Promise<RaceLog> {
  const { data, error } = await supabase
    .from('logs')
    .insert([
      {
        user_id: userId,
        ...input,
        watched_at: input.watched_at || new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRaceLog(
  userId: string,
  matchId: number,
  input: Partial<CreateRaceLogInput>
): Promise<RaceLog> {
  const { data, error } = await supabase
    .from('logs')
    .update(input)
    .eq('user_id', userId)
    .eq('match_id', matchId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

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