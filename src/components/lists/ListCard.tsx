'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import type { ListDetails } from '@/lib/types/list';
import { toggleListLike } from '@/lib/supabase/queries/lists';

interface ListCardProps {
  list: ListDetails;
  showActions?: boolean;
}

export function ListCard({ list, showActions = true }: ListCardProps) {
  const [isLiked, setIsLiked] = useState(list.is_liked);
  const [likeCount, setLikeCount] = useState(list.like_count);
  const [isLiking, setIsLiking] = useState(false);

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

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
      {/* Header with owner info */}
      <div className="flex items-center gap-3 mb-4">
        <Link 
          href={`/profile/${list.owner_username}`}
          className="flex items-center gap-2 hover:text-hala-orange"
        >
          <Image
            src={list.owner_avatar_url}
            alt={list.owner_username}
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="text-sm font-medium">{list.owner_username}</span>
        </Link>
        <span className="text-xs text-gray-400">
          {formatDistanceToNow(new Date(list.created_at), { addSuffix: true })}
        </span>
        {!list.is_public && (
          <span className="ml-auto text-xs bg-white/10 text-gray-300 px-2 py-1 rounded">
            Private
          </span>
        )}
      </div>

      {/* List title and description */}
      <Link href={`/lists/${list.id}`} className="block group">
        <h3 className="text-lg font-semibold text-white group-hover:text-hala-orange">
          {list.title}
        </h3>
        {list.description && (
          <p className="mt-1 text-sm text-gray-300 line-clamp-2">
            {list.description}
          </p>
        )}
      </Link>

      {/* Stats and actions */}
      <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M3.196 12.87l-.825.483a.75.75 0 000 1.294l7.25 4.25a.75.75 0 00.758 0l7.25-4.25a.75.75 0 000-1.294l-.825-.484-5.666 3.322a2.25 2.25 0 01-2.276 0L3.196 12.87z" />
            <path d="M3.196 8.87l-.825.483a.75.75 0 000 1.294l7.25 4.25a.75.75 0 00.758 0l7.25-4.25a.75.75 0 000-1.294l-.825-.484-5.666 3.322a2.25 2.25 0 01-2.276 0L3.196 8.87z" />
            <path d="M10.38 1.103a.75.75 0 00-.76 0l-7.25 4.25a.75.75 0 000 1.294l7.25 4.25a.75.75 0 00.76 0l7.25-4.25a.75.75 0 000-1.294l-7.25-4.25z" />
          </svg>
          <span>{list.race_count} races</span>
        </div>
        <div className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M1 8.25a1.25 1.25 0 112.5 0v7.5a1.25 1.25 0 11-2.5 0v-7.5zM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0114 3c0 .995-.182 1.948-.514 2.826-.204.54.166 1.174.744 1.174h2.52c1.243 0 2.261 1.01 2.146 2.247a23.864 23.864 0 01-1.341 5.974C17.153 16.323 16.072 17 14.9 17h-3.192a3 3 0 01-1.341-.317l-2.734-1.366A3 3 0 006.292 15H5V8h.963c.685 0 1.258-.483 1.612-1.068a4.011 4.011 0 012.166-1.73c.432-.143.853-.386 1.011-.814.16-.432.248-.9.248-1.388z" />
          </svg>
          <span>{likeCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 001.33 0l1.713-3.293a.783.783 0 01.642-.413 41.102 41.102 0 003.55-.414c1.437-.232 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zM6.75 6a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 2.5a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" clipRule="evenodd" />
          </svg>
          <span>{list.comment_count}</span>
        </div>

        {showActions && (
          <div className="ml-auto">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`
                flex items-center gap-1 px-3 py-1 rounded-full border transition-colors
                ${isLiked 
                  ? 'bg-hala-orange/10 border-hala-orange text-hala-orange' 
                  : 'border-white/10 hover:border-hala-orange hover:text-hala-orange'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isLiking ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M1 8.25a1.25 1.25 0 112.5 0v7.5a1.25 1.25 0 11-2.5 0v-7.5zM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0114 3c0 .995-.182 1.948-.514 2.826-.204.54.166 1.174.744 1.174h2.52c1.243 0 2.261 1.01 2.146 2.247a23.864 23.864 0 01-1.341 5.974C17.153 16.323 16.072 17 14.9 17h-3.192a3 3 0 01-1.341-.317l-2.734-1.366A3 3 0 006.292 15H5V8h.963c.685 0 1.258-.483 1.612-1.068a4.011 4.011 0 012.166-1.73c.432-.143.853-.386 1.011-.814.16-.432.248-.9.248-1.388z" />
                </svg>
              )}
              <span className="text-sm">
                {isLiked ? 'Liked' : 'Like'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 