import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserId } from '@/lib/auth/useUserId';
import { getListComments, addListComment, deleteListComment } from '@/lib/supabase/queries/lists';
import type { ListComment } from '@/lib/types/list';

interface ListCommentsProps {
  listId: string;
  isSignedIn: boolean;
}

export function ListComments({ listId, isSignedIn }: ListCommentsProps) {
  const router = useRouter();
  const userId = useUserId();
  const [comments, setComments] = useState<ListComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchComments() {
      try {
        setIsLoading(true);
        const data = await getListComments(listId);
        setComments(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load comments');
      } finally {
        setIsLoading(false);
      }
    }

    fetchComments();
  }, [listId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isSignedIn) return;

    try {
      setIsSubmitting(true);
      const comment = await addListComment(listId, newComment.trim());
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteListComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-white/5 rounded w-1/4 mb-2" />
            <div className="h-4 bg-white/5 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="text-red-500">{error}</p>
      )}

      {/* Comment form */}
      {isSignedIn ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full h-24 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-hala-orange focus:border-transparent resize-none"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="px-4 py-2 bg-hala-orange text-white rounded-md hover:bg-hala-orange/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-400">
            Please{' '}
            <button
              onClick={() => router.push('/sign-in')}
              className="text-hala-orange hover:underline"
            >
              sign in
            </button>
            {' '}to leave a comment.
          </p>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-center text-gray-400">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white/5 rounded-lg p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">
                    {comment.user_username}
                  </span>
                  <span className="text-sm text-gray-400">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                {comment.user_id === userId && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-gray-400 hover:text-red-500 transition"
                    title="Delete comment"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-gray-300">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 