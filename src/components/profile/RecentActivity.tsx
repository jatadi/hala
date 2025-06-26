'use client';

import { useEffect, useState } from 'react';
import { getUserRecentLogs, type UserRaceLog } from '@/lib/supabase/queries/logs';
import Link from 'next/link';
import { StarRating } from '@/components/ui/StarRating';

interface RecentActivityProps {
  userId: string;
}

export function RecentActivity({ userId }: RecentActivityProps) {
  const [logs, setLogs] = useState<UserRaceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecentLogs() {
      try {
        setIsLoading(true);
        const recentLogs = await getUserRecentLogs(userId);
        setLogs(recentLogs);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recent activity');
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecentLogs();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/5 p-4 rounded-lg space-y-2">
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-4 bg-white/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
        <p className="text-gray-400">No race logs yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
            <Link 
              href={`/races/${log.race_id}`}
              className="text-hala-orange hover:text-hala-orange/80"
            >
              {log.race_name}
            </Link>
            <div className="mt-2 flex items-center gap-4">
              <StarRating value={log.rating} readOnly />
              <span className="text-gray-400">
                {new Date(log.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
            {log.review && (
              <p className="mt-2 text-gray-300 line-clamp-2">{log.review}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 