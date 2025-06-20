import { Navbar } from '@/components/navbar';
import { SeasonNavigation } from '@/components/match/SeasonNavigation';
import { RaceCard } from '@/components/match/RaceCard';
import { getAllF1Races } from '@/lib/supabase/queries/races';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RacesPage() {
  const allRaces = await getAllF1Races();
  
  // Sort races by date in descending order and take the 4 most recent
  const recentRaces = allRaces
    .sort((a, b) => new Date(b.race_date).getTime() - new Date(a.race_date).getTime())
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-b from-hala-blue via-slate-900 to-hala-dark">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">F1 Races</h1>
            <p className="text-gray-400">Track and rate every Formula 1 race of the season</p>
          </div>

          <SeasonNavigation currentPage="all" />

          {/* Race Grid - Centered with fixed-width cards */}
          <div className="max-w-6xl mx-auto px-4">
            {recentRaces.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No races available yet</p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-white mb-6">Recent Races</h2>
                <div className="flex flex-wrap justify-center gap-6">
                  {recentRaces.map((race) => (
                    <RaceCard
                      key={race.race_id}
                      name={race.race_name}
                      imageUrl={race.poster_url || ''}
                      date={race.year.toString()}
                      raceId={race.race_id}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 