'use client';

import { RaceDetails } from '@/lib/types/race';
import Image from 'next/image';
import { useState } from 'react';
import { StarRating } from '@/components/ui/StarRating';
import Link from 'next/link';

interface RaceHeaderProps {
  race: RaceDetails;
}

export function RaceHeader({ race }: RaceHeaderProps) {
  const [showWinner, setShowWinner] = useState(false);
  const raceDate = new Date(race.race_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Poster */}
        <div className="w-full md:w-80 flex-shrink-0">
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-hala-blue-darker">
            {race.poster_url ? (
              <Image
                src={race.poster_url}
                alt={race.race_name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                No poster available
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-white mb-4">
            {race.race_name}
          </h1>

          <div className="space-y-6">
            {/* Race Info */}
            <div className="space-y-2">
              <p className="text-xl text-gray-300">{raceDate}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-300">
                <div>
                  <span className="text-gray-400">Circuit:</span> {race.circuit}
                </div>
                <div>
                  <span className="text-gray-400">Location:</span> {race.location}, {race.country}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6">
              {race.average_rating !== null && (
                <div className="flex items-center gap-2">
                  <StarRating rating={race.average_rating} size="lg" />
                  <span className="text-gray-400 text-lg">
                    ({race.average_rating.toFixed(1)})
                  </span>
                </div>
              )}
              <Link
                href={`/races/${race.race_id}/watchers`}
                className="text-hala-orange hover:text-hala-orange/80 text-lg"
              >
                {race.watchers_count} {race.watchers_count === 1 ? 'person' : 'people'} watched
              </Link>
            </div>

            {/* Winner (if past race) */}
            {race.is_past_race && race.winner && (
              <div className="mt-4">
                <div className="text-gray-300">
                  <span className="text-gray-400">Winner:</span>{' '}
                  {showWinner ? (
                    race.winner
                  ) : (
                    <button
                      onClick={() => setShowWinner(true)}
                      className="text-hala-orange hover:text-hala-orange/80"
                    >
                      Show Winner
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 