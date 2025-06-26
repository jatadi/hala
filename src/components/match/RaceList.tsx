'use client';

import { useUserId } from '@/lib/auth/useUserId';
import { RaceCard } from './RaceCard';
import type { F1Race } from '@/lib/types/f1';

interface RaceListProps {
  races: F1Race[];
}

export function RaceList({ races }: RaceListProps) {
  const userId = useUserId();

  if (races.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No races available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-6">
      {races.map((race) => (
        <RaceCard
          key={race.race_id}
          name={race.race_name}
          imageUrl={race.poster_url || ''}
          date={race.year.toString()}
          raceId={race.race_id}
          round={race.round}
          circuit={race.circuit}
          userId={userId ?? undefined}
        />
      ))}
    </div>
  );
} 