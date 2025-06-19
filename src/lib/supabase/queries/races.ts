import { supabase } from '../client';
import type { F1Race } from '@/lib/types/f1';

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
    .select(F1_RACE_FIELDS)
    .order('race_date', { ascending: true });

  if (error) throw error;
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