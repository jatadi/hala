import { RaceCard } from '@/components/match/RaceCard';
import { F1Race } from '@/lib/types/f1';

interface RecentActivityProps {
  recentRaces: F1Race[];
}

export function RecentActivity({ recentRaces }: RecentActivityProps) {
  if (recentRaces.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No races watched yet</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {recentRaces.map((race) => (
          <RaceCard
            key={race.race_id}
            raceId={race.race_id}
            name={race.race_name}
            imageUrl={race.poster_url || ''}
            date={race.year.toString()}
          />
        ))}
      </div>
    </div>
  );
} 