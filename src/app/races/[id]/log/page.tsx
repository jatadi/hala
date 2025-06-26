'use client';

import { Navbar } from '@/components/navbar';
import { useUserId } from '@/lib/auth/useUserId';
import { getRaceDetails } from '@/lib/supabase/queries/races';
import { getUserRaceLog } from '@/lib/supabase/queries/logs';
import { RaceLogForm } from '@/components/race/RaceLogForm';
import { Toast } from '@/components/ui/Toast';
import { notFound, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { RaceDetails } from '@/lib/types/race';
import type { UserRaceLog } from '@/lib/supabase/queries/logs';

interface LogPageProps {
  params: {
    id: string;
  };
}

export default function LogPage({ params }: LogPageProps) {
  const userId = useUserId();
  const router = useRouter();
  const [race, setRace] = useState<RaceDetails | null>(null);
  const [userLog, setUserLog] = useState<UserRaceLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const raceId = parseInt(params.id, 10);

  const fetchData = useCallback(async () => {
    try {
      console.log('Fetching data for race:', raceId);
      setIsLoading(true);
      const [raceDetails, log] = await Promise.all([
        getRaceDetails(raceId),
        userId ? getUserRaceLog(userId, raceId) : null
      ]);

      if (!raceDetails) {
        notFound();
      }

      setRace(raceDetails);
      setUserLog(log);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load race details');
    } finally {
      setIsLoading(false);
    }
  }, [raceId, userId]);

  // Handle authentication check
  useEffect(() => {
    console.log('Auth state changed:', { userId });
    
    if (userId === null) {
      // We know user is not authenticated
      console.log('User is not authenticated, redirecting to sign-in');
      router.push('/sign-in');
    } else if (userId !== undefined) {
      // We have a definite auth state (either logged in or not)
      console.log('User auth state confirmed:', userId);
      fetchData();
    } else {
      // userId is undefined, still checking
      console.log('Still checking auth status...');
    }
  }, [userId, router, fetchData]);

  const handleLogSuccess = () => {
    setShowToast(true);
    // Refresh user's log
    if (userId) {
      getUserRaceLog(userId, raceId).then(setUserLog);
    }
  };

  // Show loading state while checking auth
  if (userId === undefined) {
    return (
      <div className="min-h-screen bg-hala-dark">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/5 rounded w-3/4" />
            <div className="h-4 bg-white/5 rounded w-1/2" />
            <div className="h-64 bg-white/5 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-hala-dark">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/5 rounded w-3/4" />
            <div className="h-4 bg-white/5 rounded w-1/2" />
            <div className="h-64 bg-white/5 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !race) {
    return (
      <div className="min-h-screen bg-hala-dark">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/races/${race.race_id}`}
            className="text-hala-orange hover:text-hala-orange/80"
          >
            ← Back to {race.race_name}
          </Link>
          <h1 className="text-3xl font-bold text-white mt-4">
            Log Your Watch: {race.race_name}
          </h1>
          <p className="text-gray-400 mt-2">
            {new Date(race.race_date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Log Form */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
          {userId ? (
            <RaceLogForm 
              raceId={raceId} 
              userId={userId} 
              onSuccess={handleLogSuccess}
              initialData={userLog ? {
                rating: userLog.rating,
                review: userLog.review
              } : undefined}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">Please sign in to log your race watch.</p>
            </div>
          )}
        </div>

        {/* Race Info */}
        <div className="mt-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Race Information</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-gray-400">Circuit</dt>
              <dd className="text-white">{race.circuit}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Country</dt>
              <dd className="text-white">{race.country}</dd>
            </div>
            {race.winner && (
              <div>
                <dt className="text-gray-400">Winner</dt>
                <dd className="text-white">{race.winner}</dd>
              </div>
            )}
          </dl>
        </div>
      </main>

      {/* Success Toast */}
      {showToast && (
        <Toast
          message={`${race.race_name} has been saved to your diary`}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
} 