import { Navbar } from '@/components/navbar';
import { SeasonNavigation } from '@/components/match/SeasonNavigation';
import { RaceCard } from '@/components/match/RaceCard';
import { getAllF1Races } from '@/lib/supabase/queries/races';

export default async function RacesPage() {
  const races = await getAllF1Races();

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
            <div className="flex flex-wrap justify-center gap-6">
              {races.map((race) => (
                <RaceCard
                  key={race.race_id}
                  name={race.race_name}
                  imageUrl={race.poster_url || ''}
                  date={race.year.toString()}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 