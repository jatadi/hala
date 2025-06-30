'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import type { ListDetails, CreateListRequest } from '@/lib/types/list';
import { toggleListLike, deleteList, updateList } from '@/lib/supabase/queries/lists';
import { useRouter } from 'next/navigation';
import { ListForm } from './ListForm';
import { FollowButton } from '../social/FollowButton';

interface ListHeaderProps {
  list: ListDetails;
  isOwner: boolean;
}

export function ListHeader({ list, isOwner }: ListHeaderProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(list.is_liked);
  const [likeCount, setLikeCount] = useState(list.like_count);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLike = async () => {
    if (isLiking) return;

    try {
      setIsLiking(true);
      const newIsLiked = await toggleListLike(list.id);
      setIsLiked(newIsLiked);
      setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this list?')) {
      return;
    }

    try {
      await deleteList(list.id);
      router.push('/lists');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete list');
    }
  };

  const handleSave = async (data: CreateListRequest) => {
    try {
      await updateList(list.id, data);
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update list');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
        <ListForm
          initialValues={{
            title: list.title,
            description: list.description || '',
            is_public: list.is_public
          }}
          onSubmit={handleSave}
          onCancel={() => setIsEditing(false)}
        />
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{list.title}</h1>
          {list.description && (
            <p className="mt-2 text-gray-400">{list.description}</p>
          )}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center text-sm text-gray-400">
              <span>{list.owner_username}</span>
              <span className="mx-2">•</span>
              <span>{list.is_public ? 'Public' : 'Private'}</span>
              {list.created_at && (
                <>
                  <span className="mx-2">•</span>
                  <span>
                    {new Date(list.created_at).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!isOwner && (
            <FollowButton
              entityId={list.id}
              entityType="list"
              initialIsFollowing={list.is_following}
            />
          )}
          {isOwner && (
            <>
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-hala-orange hover:bg-hala-orange/80 rounded-md transition"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 