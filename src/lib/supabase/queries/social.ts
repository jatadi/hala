import { supabase } from '../client';
import type { UserProfile } from '@/lib/types/user';

/**
 * Follow a user
 * @param userId - The ID of the user to follow
 * @returns Success status and any error
 */
export async function followUser(userId: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: session.user.id,
        following_id: userId
      });

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error following user:', error);
    return { success: false, error: error as Error };
  }
}

/**
 * Unfollow a user
 * @param userId - The ID of the user to unfollow
 * @returns Success status and any error
 */
export async function unfollowUser(userId: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('follows')
      .delete()
      .match({
        follower_id: session.user.id,
        following_id: userId
      });

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return { success: false, error: error as Error };
  }
}

/**
 * Get a user's followers
 * @param userId - The ID of the user whose followers to get
 * @returns Array of followers and any error
 */
export async function getFollowers(userId: string): Promise<{ 
  followers: UserProfile[];
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .rpc('get_user_followers', { user_id: userId });

    if (error) throw error;
    return { followers: data || [], error: null };
  } catch (error) {
    console.error('Error getting followers:', error);
    return { followers: [], error: error as Error };
  }
}

/**
 * Get users that a user is following
 * @param userId - The ID of the user whose following list to get
 * @returns Array of followed users and any error
 */
export async function getFollowing(userId: string): Promise<{
  following: UserProfile[];
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .rpc('get_user_following', { user_id: userId });

    if (error) throw error;
    return { following: data || [], error: null };
  } catch (error) {
    console.error('Error getting following:', error);
    return { following: [], error: error as Error };
  }
}

/**
 * Check if one user follows another
 * @param followingId - The ID of the user to check if being followed
 * @returns Boolean indicating follow status and any error
 */
export async function checkIsFollowing(followingId: string): Promise<{
  isFollowing: boolean;
  error: Error | null;
}> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { isFollowing: false, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .rpc('check_is_following', {
        follower_id: session.user.id,
        following_id: followingId
      });

    if (error) throw error;
    return { isFollowing: data || false, error: null };
  } catch (error) {
    console.error('Error checking follow status:', error);
    return { isFollowing: false, error: error as Error };
  }
} 