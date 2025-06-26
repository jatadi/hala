'use client';

import { useState, useEffect } from 'react';
import { followUser, unfollowUser, checkIsFollowing } from '@/lib/supabase/queries/social';
import { Modal } from '@/components/ui/Modal';

interface FollowButtonProps {
  userId: string;
  onFollowChange?: (isFollowing: boolean) => void;
  className?: string;
  username?: string; // Optional username for better UX in confirmation dialog
}

export function FollowButton({
  userId,
  onFollowChange,
  className = '',
  username,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);

  // Check initial follow status on mount
  useEffect(() => {
    let isMounted = true;

    const checkFollowStatus = async () => {
      try {
        const { isFollowing, error } = await checkIsFollowing(userId);
        if (error) throw error;
        if (isMounted) {
          setIsFollowing(isFollowing);
        }
      } catch (err) {
        console.error('Error checking follow status:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          setIsFollowing(false);
        }
      }
    };

    checkFollowStatus();
    return () => { isMounted = false; };
  }, [userId]);

  const handleUnfollow = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { success, error } = await unfollowUser(userId);
      if (error) throw error;

      setIsFollowing(false);
      onFollowChange?.(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error unfollowing:', err);
    } finally {
      setIsLoading(false);
      setShowUnfollowModal(false);
    }
  };

  const handleFollow = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { success, error } = await followUser(userId);
      if (error) throw error;

      setIsFollowing(true);
      onFollowChange?.(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error following:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (isFollowing === null) return; // Don't allow clicks while initial state is loading
    
    if (isFollowing) {
      setShowUnfollowModal(true);
    } else {
      handleFollow();
    }
  };

  // Show loading state while initial follow status is being checked
  if (isFollowing === null) {
    return (
      <button
        disabled
        className={`px-4 py-2 rounded-full bg-gray-200 text-gray-500 cursor-not-allowed ${className}`}
      >
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`px-4 py-2 rounded-full transition-colors ${
          isFollowing
            ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        aria-label={isFollowing ? 'Unfollow user' : 'Follow user'}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {isFollowing ? 'Unfollowing...' : 'Following...'}
          </span>
        ) : (
          <span>{isFollowing ? 'Following' : 'Follow'}</span>
        )}
        {error && (
          <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-sm text-red-500">
            {error}
          </span>
        )}
      </button>

      <Modal
        isOpen={showUnfollowModal}
        onClose={() => setShowUnfollowModal(false)}
        title={`Unfollow ${username ? `@${username}` : 'User'}`}
        primaryAction={{
          label: 'Unfollow',
          onClick: handleUnfollow,
          variant: 'danger',
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setShowUnfollowModal(false),
        }}
      >
        <p>
          You will no longer see {username ? `@${username}'s` : "this user's"} activity in your feed.
          You can always follow them again later.
        </p>
      </Modal>
    </>
  );
} 