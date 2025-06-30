import { supabase } from '../client';
import type { UserProfile } from '@/lib/types/user';
import type { ListDetails } from '@/lib/types/list';

interface FollowResponse {
  success: boolean;
  error?: string;
}

/**
 * Follow a user
 * @param entityId - The ID of the user to follow
 * @returns Success status and any error
 */
export async function followUser(userId: string): Promise<{ success: boolean; error?: string }> {
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
    return { success: true };
  } catch (error) {
    console.error('Error following user:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' };
  }
}

/**
 * Unfollow a user
 * @param entityId - The ID of the user to unfollow
 * @returns Success status and any error
 */
export async function unfollowUser(userId: string): Promise<{ success: boolean; error?: string }> {
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
    return { success: true };
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' };
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
 * @param entityId - The ID of the user to check if being followed
 * @returns Boolean indicating follow status and any error
 */
export async function checkIsFollowing(userId: string): Promise<{ isFollowing: boolean; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { isFollowing: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .rpc('check_is_following', {
        follower_id: session.user.id,
        following_id: userId
      });

    if (error) throw error;
    return { isFollowing: data || false };
  } catch (error) {
    console.error('Error checking follow status:', error);
    return { isFollowing: false, error: error instanceof Error ? error.message : 'An error occurred' };
  }
}

export async function getFollowedUsersLists(): Promise<ListDetails[]> {
  const { data, error } = await supabase
    .rpc('get_followed_users_lists');

  if (error) throw error;
  return data;
}

export async function toggleListFollow(listId: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('toggle_list_follow', { p_list_id: listId });

  if (error) throw error;
  return data;
}

export async function toggleUserFollow(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('toggle_user_follow', { p_user_id: userId });

  if (error) throw error;
  return data;
} 