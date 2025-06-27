import { supabase } from '../client';
import type { Activity, FeedOptions } from '@/lib/types/activity';

export type ActivitySource = 'all' | 'you' | 'following';

/**
 * Get filtered activities for a user
 */
export async function getFilteredActivities(
  userId: string,
  source: ActivitySource = 'all',
  options: FeedOptions = {}
): Promise<Activity[]> {
  const { limit = 20, offset = 0 } = options;

  const { data, error } = await supabase
    .rpc('get_filtered_activities', {
      user_id_param: userId,
      source,
      limit_param: limit,
      offset_param: offset
    });

  if (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get activities for a specific user's profile
 */
export async function getUserActivities(
  userId: string,
  options: FeedOptions = {}
): Promise<Activity[]> {
  return getFilteredActivities(userId, 'you', options);
} 