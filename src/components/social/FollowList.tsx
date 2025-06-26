'use client';

import { useEffect, useState } from 'react';
import { UserProfile } from '@/lib/types/user';
import { getFollowers, getFollowing } from '@/lib/supabase/queries/social';
import Link from 'next/link';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import { FollowButton } from './FollowButton';

interface FollowListProps {
  userId: string;
  type: 'followers' | 'following';
  currentUserId?: string;
}

const USERS_PER_PAGE = 12;

export function FollowList({ userId, type, currentUserId }: FollowListProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();

  const loadUsers = async () => {
    try {
      setError(null);
      const fetchFunction = type === 'followers' ? getFollowers : getFollowing;
      const response = await fetchFunction(userId);
      
      if (response.error) throw response.error;
      
      const newUsers = type === 'followers' 
        ? (response as { followers: UserProfile[] }).followers 
        : (response as { following: UserProfile[] }).following;

      setUsers(prevUsers => {
        const uniqueUsers = [...prevUsers];
        newUsers.forEach((user: UserProfile) => {
          if (!uniqueUsers.find(u => u.id === user.id)) {
            uniqueUsers.push(user);
          }
        });
        return uniqueUsers;
      });
      setHasMore(newUsers.length === USERS_PER_PAGE);
    } catch (err) {
      console.error(`Error loading ${type}:`, err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadUsers();
  }, [userId, type]);

  // Load more when scrolling to bottom
  useEffect(() => {
    if (inView && !loading && hasMore) {
      loadUsers();
    }
  }, [inView]);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={loadUsers}
          className="mt-4 px-4 py-2 bg-hala-orange hover:bg-hala-orange-dark text-white rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid of users */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div
            key={user.id}
            className="bg-white rounded-lg p-6 shadow-md flex items-center space-x-4"
          >
            {/* Avatar */}
            <Link
              href={`/profile/${user.username}`}
              className="flex-shrink-0 relative w-12 h-12 rounded-full overflow-hidden bg-gray-200"
            >
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.username}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-hala-blue text-white text-xl">
                  {user.username[0].toUpperCase()}
                </div>
              )}
            </Link>

            {/* User info and follow button */}
            <div className="flex-grow min-w-0">
              <Link
                href={`/profile/${user.username}`}
                className="font-medium text-gray-900 hover:text-hala-orange truncate block"
              >
                {user.username}
              </Link>
              {user.bio && (
                <p className="text-sm text-gray-500 truncate">
                  {user.bio}
                </p>
              )}
            </div>

            {/* Follow button (don't show for current user) */}
            {currentUserId && currentUserId !== user.id && (
              <div className="flex-shrink-0">
                <FollowButton
                  userId={user.id}
                  username={user.username}
                  className="text-sm"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Loading states */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(USERS_PER_PAGE)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-6 shadow-md flex items-center space-x-4"
            >
              <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
              <div className="flex-grow space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Infinite scroll trigger */}
      {!loading && hasMore && (
        <div ref={ref} className="h-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-hala-orange" />
        </div>
      )}

      {/* Empty state */}
      {!loading && users.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No {type} yet
          </p>
        </div>
      )}
    </div>
  );
} 