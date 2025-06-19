import { supabase } from '../client';
import { UserProfile } from '@/lib/types/user';

export async function getProfileStats(username: string): Promise<UserProfile | null> {
  // First get the base user data
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (userError) {
    console.error('Error fetching user:', userError);
    return null;
  }

  // Then get the stats using a direct query
  const { data: stats, error: statsError } = await supabase
    .rpc('get_profile_stats', { username_param: username });

  if (statsError) {
    console.error('Error fetching stats:', statsError);
    return null;
  }

  // Combine user data with stats
  return {
    ...user,
    ...stats[0]
  };
} 