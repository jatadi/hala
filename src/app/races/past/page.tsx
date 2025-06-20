import { Navbar } from '@/components/navbar';
import { SeasonNavigation } from '@/components/match/SeasonNavigation';
import { RaceCard } from '@/components/match/RaceCard';
import { getPastF1Races } from '@/lib/supabase/queries/races';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PastRacesPage() {
  const races = await getPastF1Races();

  return (
    <div className="min-h-screen bg-gradient-to-b from-hala-blue via-slate-900 to-hala-dark">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Past F1 Races</h1>
            <p className="text-gray-400">Review and rate completed Formula 1 races</p>
          </div>

          <SeasonNavigation currentPage="past" />

          {/* Race Grid - Centered with fixed-width cards */}
          <div className="max-w-6xl mx-auto px-4">
            {races.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No past races available</p>
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