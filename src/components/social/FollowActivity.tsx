'use client';

import { FollowActivity as FollowActivityType } from '@/lib/types/activity';
import Image from 'next/image';
import Link from 'next/link';

interface FollowActivityProps {
  activity: FollowActivityType;
}

export function FollowActivity({ activity }: FollowActivityProps) {
  return (
    <div className="p-4">
      <div className="flex items-start space-x-4">
        {/* User Avatar */}
        <Link
          href={`/profile/${activity.username}`}
          className="flex-shrink-0 relative w-10 h-10 rounded-full overflow-hidden bg-gray-200"
        >
          {activity.avatar_url ? (
            <Image
              src={activity.avatar_url}
              alt={activity.username}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-hala-blue text-white text-xl">
              {activity.username[0].toUpperCase()}
            </div>
          )}
        </Link>

        {/* Activity Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline space-x-2">
            <Link
              href={`/profile/${activity.username}`}
              className="text-white hover:text-hala-orange font-medium"
            >
              {activity.username}
            </Link>
            <span className="text-gray-400">followed</span>
            <Link
              href={`/profile/${activity.target_username}`}
              className="text-white hover:text-hala-orange font-medium"
            >
              {activity.target_username}
            </Link>
          </div>

          {/* Timestamp */}
          <div className="mt-2 text-sm text-gray-400">
            <time dateTime={activity.created_at}>
              {new Date(activity.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </time>
          </div>
        </div>
      </div>
    </div>
  );
} 