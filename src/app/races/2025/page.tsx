import { Navbar } from '@/components/navbar';
import { SeasonNavigation } from '@/components/match/SeasonNavigation';
import { RaceCard } from '@/components/match/RaceCard';
import { getF1RacesByYear } from '@/lib/supabase/queries/races';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Season2025Page() {
  const races = await getF1RacesByYear(2025);

  return (
    <div className="min-h-screen bg-gradient-to-b from-hala-blue via-slate-900 to-hala-dark">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">2025 F1 Season</h1>
            <p className="text-gray-400">All races in the 2025 Formula 1 World Championship</p>
          </div>

          <SeasonNavigation currentPage="2025" />

          {/* Race Grid - Centered with fixed-width cards */}
          <div className="max-w-6xl mx-auto px-4">
            {races.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No races scheduled for 2025 yet</p>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-6">
                {races.map((race) => (
                  <RaceCard
                    key={race.race_id}
                    name={race.race_name}
                    imageUrl={race.poster_url || ''}
                    date={race.year.toString()}
                    raceId={race.race_id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 