'use client';

import { useState } from 'react';
import { StarRating } from '../ui/StarRating';
import { logRaceWatch } from '@/lib/supabase/queries/logs';
import type { LogUpdate } from '@/lib/types/log';

interface RaceLogFormProps {
  raceId: number;
  userId: string;
  initialData?: {
    rating: number | null;
    review: string | null;
  };
  onSuccess?: () => void;
}

export function RaceLogForm({ raceId, userId, initialData, onSuccess }: RaceLogFormProps) {
  const [isWatched, setIsWatched] = useState(!!initialData);
  const [rating, setRating] = useState<number | null>(initialData?.rating ?? null);
  const [review, setReview] = useState(initialData?.review ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const updates: LogUpdate = {
        rating: isWatched ? rating : null,
        review: isWatched && review ? review : null
      };
      await logRaceWatch(userId, raceId, updates);
      onSuccess?.();
      
      // Reset form if it's a new log
      if (!initialData) {
        setIsWatched(false);
        setRating(null);
        setReview('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save log');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Watch Toggle */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="watched"
          checked={isWatched}
          onChange={(e) => setIsWatched(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
          disabled={isSubmitting}
        />
        <label htmlFor="watched" className="text-sm font-medium text-gray-700">
          I've watched this race
        </label>
      </div>

      {/* Rating and Review (only shown if watched) */}
      {isWatched && (
        <>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Rating</label>
            <StarRating
              value={rating ?? 0}
              onChange={setRating}
              readOnly={isSubmitting}
              size="md"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="review" className="text-sm font-medium text-gray-700">
              Review
            </label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              disabled={isSubmitting}
              maxLength={1000}
              placeholder="Share your thoughts about the race..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              rows={4}
            />
            <div className="text-xs text-gray-500 mt-1">
              {review.length}/1000 characters
            </div>
          </div>
        </>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`
          w-full rounded-md px-4 py-2 text-sm font-medium text-white
          ${isSubmitting 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
          }
        `}
      >
        {isSubmitting ? 'Saving...' : 'Save Log'}
      </button>
    </form>
  );
} 