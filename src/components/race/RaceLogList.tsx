'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { StarRating } from '../ui/StarRating';
import { getRaceLogs } from '@/lib/supabase/queries/logs';
import type { RaceLog } from '@/lib/supabase/queries/logs';

interface RaceLogListProps {
  raceId: number;
}

type SortOption = 'recent' | 'rating';
type FilterOption = 'all' | 'rated' | 'reviewed';

const LOGS_PER_PAGE = 10;

function LogSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full" />
        <div className="h-4 bg-gray-200 rounded w-24" />
      </div>
      <div className="space-x-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="inline-block w-4 h-4 bg-gray-200 rounded" />
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

export const RaceLogList = forwardRef<{ refreshLogs: () => void }, RaceLogListProps>(
  function RaceLogList({ raceId }, ref) {
    const [logs, setLogs] = useState<RaceLog[]>([]);
    const [sortBy, setSortBy] = useState<SortOption>('recent');
    const [filterBy, setFilterBy] = useState<FilterOption>('all');
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function fetchLogs() {
      try {
        setIsLoading(true);
        const raceLogs = await getRaceLogs(raceId);
        setLogs(raceLogs);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load logs');
      } finally {
        setIsLoading(false);
      }
    }

    useEffect(() => {
      fetchLogs();
    }, [raceId]);

    useImperativeHandle(ref, () => ({
      refreshLogs: fetchLogs
    }));

    const filteredLogs = logs.filter(log => {
      switch (filterBy) {
        case 'rated':
          return log.rating !== null;
        case 'reviewed':
          return log.review !== null;
        default:
          return true;
      }
    });

    const sortedAndFilteredLogs = [...filteredLogs].sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        if (a.rating === null) return 1;
        if (b.rating === null) return -1;
        return (b.rating - a.rating);
      }
    });

    const totalPages = Math.ceil(sortedAndFilteredLogs.length / LOGS_PER_PAGE);
    const paginatedLogs = sortedAndFilteredLogs.slice(
      (page - 1) * LOGS_PER_PAGE,
      page * LOGS_PER_PAGE
    );

    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg border border-gray-200">
              <LogSkeleton />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return <div className="text-red-600 py-4">{error}</div>;
    }

    if (sortedAndFilteredLogs.length === 0) {
      return <div className="text-gray-500 py-4">No logs found for this race.</div>;
    }

    return (
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 pb-4 border-b">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="recent">Most Recent</option>
              <option value="rating">Highest Rating</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Filter</label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="all">All Logs</option>
              <option value="rated">With Rating</option>
              <option value="reviewed">With Review</option>
            </select>
          </div>
        </div>

        {/* Log List */}
        <div className="space-y-4">
          {paginatedLogs.map((log) => (
            <div 
              key={log.log_id}
              className="p-4 rounded-lg border border-gray-200 space-y-3"
            >
              {/* User Info */}
              <div className="flex items-center space-x-3">
                {log.avatar_url ? (
                  <img 
                    src={log.avatar_url} 
                    alt={log.username}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200" />
                )}
                <span className="font-medium">{log.username}</span>
              </div>

              {/* Rating */}
              {log.rating !== null && (
                <div>
                  <StarRating 
                    value={log.rating} 
                    readOnly
                    size="md"
                  />
                </div>
              )}

              {/* Review */}
              {log.review && (
                <p className="text-gray-700">{log.review}</p>
              )}

              {/* Timestamp */}
              <div className="text-sm text-gray-500">
                {new Date(log.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`
                px-3 py-1 rounded
                ${page === 1 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }
              `}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`
                px-3 py-1 rounded
                ${page === totalPages 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }
              `}
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  }
); 