'use client';

import { UserProfile } from '@/lib/types/user';
import Image from 'next/image';
import Link from 'next/link';
import { FollowButton } from '@/components/social/FollowButton';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

interface ProfileHeaderProps {
  profile: UserProfile;
  isCurrentUser: boolean;
  onTabChange?: (tab: 'activity' | 'followers' | 'following') => void;
}

export function ProfileHeader({ profile, isCurrentUser, onTabChange }: ProfileHeaderProps) {
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);

  // Fetch initial counts
  useEffect(() => {
    const fetchCounts = async () => {
      const { data: followers, error: followersError } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', profile.id);

      const { data: following, error: followingError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', profile.id);

      if (!followersError) {
        setFollowerCount(followers?.length ?? 0);
      }
      if (!followingError) {
        setFollowingCount(following?.length ?? 0);
      }
    };

    fetchCounts();

    // Subscribe to changes in follows table
    const followsChannel = supabase
      .channel('follows_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `following_id=eq.${profile.id}`,
        },
        () => {
          fetchCounts(); // Refetch counts when follows change
        }
      )
      .subscribe();

    return () => {
      followsChannel.unsubscribe();
    };
  }, [profile.id]);
  
  const handleFollowChange = (isFollowing: boolean) => {
    // Update the follower count optimistically
    setFollowerCount(prev => {
      if (prev === null) return isFollowing ? 1 : 0;
      return isFollowing ? prev + 1 : prev - 1;
    });
  };

  return (
    <div className="relative">
      {/* Profile Background */}
      <div className="h-48 bg-gradient-to-r from-hala-blue to-hala-dark" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
          <div className="flex">
            {/* Avatar */}
            <div className="h-24 w-24 sm:h-32 sm:w-32 relative rounded-full ring-4 ring-white overflow-hidden bg-gray-800">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.username}
                  fill
                  sizes="(max-width: 640px) 96px, 128px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-700 text-white text-2xl">
                  {profile.username[0].toUpperCase()}
                </div>
              )}
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
            <div className="sm:hidden md:block mt-6 min-w-0 flex-1">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-white truncate">{profile.username}</h1>
                {isCurrentUser ? (
                  <Link
                    href={`/profile/${profile.username}/edit`}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-hala-orange hover:bg-hala-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hala-orange transition-colors duration-200"
                  >
                    Edit Profile
                  </Link>
                ) : (
                  <FollowButton 
                    userId={profile.id}
                    username={profile.username}
                    onFollowChange={handleFollowChange}
                  />
                )}
              </div>
              {profile.bio && (
                <p className="text-gray-400 mt-1">{profile.bio}</p>
              )}
            </div>
            
            {/* Stats */}
            <div className="mt-6 flex flex-row justify-stretch space-x-4 sm:space-x-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{profile.races_watched ?? 0}</p>
                <p className="text-sm text-gray-400">Races</p>
              </div>
              <button 
                onClick={() => onTabChange?.('following')} 
                className="text-center hover:opacity-80"
              >
                <p className="text-2xl font-bold text-white">
                  {followingCount !== null ? followingCount : (
                    <span className="animate-pulse">...</span>
                  )}
                </p>
                <p className="text-sm text-gray-400">Following</p>
              </button>
              <button 
                onClick={() => onTabChange?.('followers')} 
                className="text-center hover:opacity-80"
              >
                <p className="text-2xl font-bold text-white">
                  {followerCount !== null ? followerCount : (
                    <span className="animate-pulse">...</span>
                  )}
                </p>
                <p className="text-sm text-gray-400">Followers</p>
              </button>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{profile.average_rating ?? 0}</p>
                <p className="text-sm text-gray-400">Avg Rating</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Profile Info */}
        <div className="sm:hidden mt-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">{profile.username}</h1>
            {isCurrentUser ? (
              <Link
                href={`/profile/${profile.username}/edit`}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-hala-orange hover:bg-hala-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hala-orange transition-colors duration-200"
              >
                Edit Profile
              </Link>
            ) : (
              <FollowButton 
                userId={profile.id}
                username={profile.username}
                onFollowChange={handleFollowChange}
              />
            )}
          </div>
          {profile.bio && (
            <p className="text-gray-400 mt-1">{profile.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
} 