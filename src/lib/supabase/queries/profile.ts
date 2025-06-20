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

  // Log the raw data
  console.log('Raw user data:', user);
  console.log('Raw stats data:', stats);

  // Combine user data with stats, ensuring we get the first row of stats
  const profile: UserProfile = {
    id: user.id,
    username: user.username,
    bio: user.bio,
    avatar_url: user.avatar_url,
    created_at: user.created_at,
    updated_at: user.updated_at,
    races_watched: Number(stats[0]?.races_watched) || 0,
    races_rated: Number(stats[0]?.races_rated) || 0,
    races_reviewed: Number(stats[0]?.races_reviewed) || 0,
    average_rating: stats[0]?.average_rating !== null ? Number(stats[0].average_rating) : null,
    last_watched_at: stats[0]?.last_watched_at || null,
    number_of_lists: Number(stats[0]?.number_of_lists) || 0,
    following_count: Number(stats[0]?.following_count) || 0,
    followers_count: Number(stats[0]?.followers_count) || 0
  };

  // Log the combined profile
  console.log('Combined profile:', profile);

  return profile;
} 