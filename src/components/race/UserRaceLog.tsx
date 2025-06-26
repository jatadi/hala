'use client';

import { useState } from 'react';
import { StarRating } from '../ui/StarRating';
import { Modal } from '../ui/Modal';
import { logRaceWatch, deleteRaceLog } from '@/lib/supabase/queries/logs';
import type { UserRaceLog as UserRaceLogType } from '@/lib/supabase/queries/logs';
import type { LogUpdate } from '@/lib/types/log';

interface UserRaceLogProps {
  log: UserRaceLogType;
  userId: string;
  raceId: number;
  onUpdate?: () => void;
  onDelete?: () => void;
}

export function UserRaceLog({ log, userId, raceId, onUpdate, onDelete }: UserRaceLogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [rating, setRating] = useState<number | null>(log.rating);
  const [review, setReview] = useState(log.review ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate() {
    setIsSubmitting(true);
    setError(null);

    try {
      const updates: LogUpdate = {
        rating,
        review: review || null // Convert empty string to null
      };
      await logRaceWatch(userId, raceId, updates);
      setIsEditing(false);
      onUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update log');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    setIsSubmitting(true);
    setError(null);

    try {
      await deleteRaceLog(userId, raceId);
      setIsDeleting(false);
      onDelete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete log');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      {/* Race Info */}
      <div>
        <h3 className="font-medium text-lg">{log.race_name}</h3>
        <p className="text-sm text-gray-500">
          {new Date(log.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Log Content */}
      {!isEditing ? (
        <div className="space-y-3">
          {/* Rating Display */}
          {log.rating !== null && (
            <div>
              <StarRating
                value={log.rating}
                readOnly
                size="md"
              />
            </div>
          )}

          {/* Review Display */}
          {log.review && (
            <p className="text-gray-700">{log.review}</p>
          )}

          {/* Timestamps */}
          <div className="text-sm text-gray-500 space-y-1">
            <p>Logged on {new Date(log.created_at).toLocaleDateString()}</p>
            {log.updated_at !== log.created_at && (
              <p>Updated on {new Date(log.updated_at).toLocaleDateString()}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => setIsDeleting(true)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        /* Edit Form */
        <div className="space-y-4">
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
              rows={4}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleUpdate}
              disabled={isSubmitting}
              className={`
                px-4 py-2 text-sm font-medium text-white rounded-md
                ${isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
                }
              `}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        title="Delete Log"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this log? This action cannot be undone.</p>
          
          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleDelete}
              disabled={isSubmitting}
              className={`
                px-4 py-2 text-sm font-medium text-white rounded-md
                ${isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700'
                }
              `}
            >
              {isSubmitting ? 'Deleting...' : 'Delete Log'}
            </button>
            <button
              onClick={() => setIsDeleting(false)}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 