'use client';

import { RaceLogActivity as RaceLogActivityType } from '@/lib/types/activity';
import { StarRating } from '@/components/ui/StarRating';
import Image from 'next/image';
import Link from 'next/link';

interface RaceLogActivityProps {
  activity: RaceLogActivityType;
}

export function RaceLogActivity({ activity }: RaceLogActivityProps) {
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
            <span className="text-gray-400">watched</span>
            <Link
              href={`/races/${activity.race_id}`}
              className="text-hala-orange hover:text-hala-orange/80"
            >
              {activity.race_name}
            </Link>
          </div>

          {/* Rating and Review */}
          <div className="mt-2 space-y-2">
            {activity.rating !== null && (
              <StarRating value={activity.rating} readOnly size="sm" />
            )}
            {activity.review && (
              <p className="text-gray-300 line-clamp-3">{activity.review}</p>
            )}
          </div>

          {/* Race Details */}
          <div className="mt-2 flex items-center space-x-2 text-sm text-gray-400">
            <span>{activity.circuit}</span>
            <span>•</span>
            <span>{activity.country}</span>
            <span>•</span>
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