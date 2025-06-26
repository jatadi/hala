'use client';

import { useEffect, useState } from 'react';
import { getUserRaceLog } from '@/lib/supabase/queries/logs';
import { StarRating } from '../ui/StarRating';

interface LogStatusBadgeProps {
  userId: string;
  raceId: number;
}

export function LogStatusBadge({ userId, raceId }: LogStatusBadgeProps) {
  const [status, setStatus] = useState<{
    rating: number | null;
    hasReview: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLogStatus() {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const log = await getUserRaceLog(userId, raceId);
        if (log) {
          setStatus({
            rating: log.rating,
            hasReview: !!log.review
          });
        }
      } catch (error) {
        console.error('Error fetching log status:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLogStatus();
  }, [userId, raceId]);

  if (isLoading || !status) return null;

  return (
    <div className="absolute bottom-2 right-2 bg-black/75 rounded-lg p-1.5 flex items-center space-x-2">
      {status.rating !== null && (
        <div className="scale-75 origin-right">
          <StarRating
            value={status.rating}
            readOnly
            size="sm"
          />
        </div>
      )}
      {status.hasReview && (
        <div className="w-4 h-4 text-yellow-400">
          {/* Simple comment icon */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 001.33 0l1.713-3.293a.783.783 0 01.642-.413 41.102 41.102 0 003.55-.414c1.437-.232 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
} 