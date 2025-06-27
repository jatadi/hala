'use client';

import { useEffect, useState } from 'react';
import { Activity } from '@/lib/types/activity';
import { getFilteredActivities, ActivitySource } from '@/lib/supabase/queries/activity';
import { useInView } from 'react-intersection-observer';
import { RaceLogActivity } from './RaceLogActivity';
import { FollowActivity } from './FollowActivity';

interface ActivityFeedProps {
  userId: string;
  source?: ActivitySource;
}

const ACTIVITIES_PER_PAGE = 10;

export function ActivityFeed({ userId, source = 'all' }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();
  const [offset, setOffset] = useState(0);

  const loadActivities = async () => {
    try {
      setError(null);
      const newActivities = await getFilteredActivities(userId, source, {
        limit: ACTIVITIES_PER_PAGE,
        offset
      });

      setActivities(prev => {
        const combined = [...prev, ...newActivities];
        // Remove duplicates based on activity_id
        return Array.from(
          new Map(combined.map(item => [item.activity_id, item])).values()
        );
      });
      
      setHasMore(newActivities.length === ACTIVITIES_PER_PAGE);
      setOffset(prev => prev + ACTIVITIES_PER_PAGE);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError(err instanceof Error ? err.message : 'Failed to load activities');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset state when source changes
  useEffect(() => {
    setActivities([]);
    setOffset(0);
    setHasMore(true);
    setIsLoading(true);
    loadActivities();
  }, [userId, source]);

  // Load more when scrolling to bottom
  useEffect(() => {
    if (inView && !isLoading && hasMore) {
      loadActivities();
    }
  }, [inView]);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => {
            setOffset(0);
            setActivities([]);
            loadActivities();
          }}
          className="mt-4 px-4 py-2 bg-hala-orange hover:bg-hala-orange-dark text-white rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Activities List */}
      <div className="space-y-4">
        {activities.map(activity => (
          <div 
            key={activity.activity_id}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden"
          >
            {activity.type === 'log' ? (
              <RaceLogActivity activity={activity} />
            ) : (
              <FollowActivity activity={activity} />
            )}
          </div>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 animate-pulse"
            >
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-white/10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-1/4" />
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {!isLoading && hasMore && (
        <div ref={ref} className="h-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-hala-orange" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && activities.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">
            {source === 'you' 
              ? "You haven't logged any activities yet"
              : source === 'following'
                ? "No activities from people you follow"
                : "No activities yet"
            }
          </p>
        </div>
      )}
    </div>
  );
} 