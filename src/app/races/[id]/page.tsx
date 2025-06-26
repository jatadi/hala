'use client';

import { Navbar } from '@/components/navbar';
import { RaceHeader } from '@/components/race/RaceHeader';
import { RaceNavigation } from '@/components/race/RaceNavigation';
import { RaceLogList } from '@/components/race/RaceLogList';
import { getRaceDetails, getAdjacentRaces } from '@/lib/supabase/queries/races';
import { useUserId } from '@/lib/auth/useUserId';
import { notFound } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import type { RaceDetails } from '@/lib/types/race';
import Link from 'next/link';

interface RacePageProps {
  params: {
    id: string;
  };
}

// Disable caching for this page
export const dynamic = 'force-dynamic';

export default function RacePage({ params }: RacePageProps) {
  const userId = useUserId();
  const [race, setRace] = useState<RaceDetails | null>(null);
  const [adjacentRaces, setAdjacentRaces] = useState<{
    previous: { id: number; name: string } | null;
    next: { id: number; name: string } | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const logListRef = useRef<{ refreshLogs: () => void } | null>(null);

  const raceId = parseInt(params.id, 10);

  useEffect(() => {
    async function fetchRaceData() {
      try {
        setIsLoading(true);
        const [raceDetails, adjacentRacesData] = await Promise.all([
          getRaceDetails(raceId),
          getAdjacentRaces(new Date().toISOString()) // Pass ISO string date
        ]);

        if (!raceDetails) {
          notFound();
        }

        setRace(raceDetails);
        // Now that we have the race date, get the correct adjacent races
        const correctAdjacentRaces = await getAdjacentRaces(raceDetails.race_date);
        setAdjacentRaces(correctAdjacentRaces);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load race details');
      } finally {
        setIsLoading(false);
      }
    }

    fetchRaceData();
  }, [raceId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-hala-dark">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-80 aspect-[2/3] bg-white/5 rounded-lg" />
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-white/5 rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-4 bg-white/5 rounded w-1/2" />
                  <div className="h-4 bg-white/5 rounded w-1/3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !race || !adjacentRaces) {
    return (
      <div className="min-h-screen bg-hala-dark">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-red-500">
            {error || 'Failed to load race details'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hala-dark">
      <Navbar />
      <RaceHeader race={race} />
      <RaceNavigation
        previousRace={adjacentRaces.previous}
        nextRace={adjacentRaces.next}
      />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Log Your Watch Button */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Log Your Watch</h2>
              <Link
                href={`/races/${raceId}/log`}
                className="px-4 py-2 bg-hala-orange text-white rounded-lg hover:bg-hala-orange/80 transition-colors"
              >
                {userId ? 'Add or Edit Log' : 'Sign in to Log'}
              </Link>
            </div>
          </div>

          {/* User Logs */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Race Logs</h2>
            <RaceLogList raceId={raceId} ref={logListRef} />
          </div>
        </div>
      </main>
    </div>
  );
} 