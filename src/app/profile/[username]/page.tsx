import { Navbar } from '@/components/navbar';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { RecentActivity } from '@/components/profile/RecentActivity';
import { F1Race } from '@/lib/types/f1';
import { notFound } from 'next/navigation';
import { debugUserProfile } from '@/lib/supabase/queries/debug';
import { getProfileStats } from '@/lib/supabase/queries/profile';
import { supabase } from '@/lib/supabase/client';

// Disable caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getRecentRaces(userId: string): Promise<F1Race[]> {
  // First get the user's recent logs
  const { data: logs, error: logsError } = await supabase
    .from('logs')
    .select('match_id, watched_at')
    .eq('user_id', userId)
    .order('watched_at', { ascending: false });

  if (logsError) {
    console.error('Error fetching logs:', logsError);
    return [];
  }

  if (!logs?.length) {
    console.log('No logs found for user:', userId);
    return [];
  }

  console.log('Found logs:', logs);

  // Then get the corresponding races
  const { data: races, error: racesError } = await supabase
    .from('f1_races')
    .select(`
      race_id,
      race_name,
      year,
      race_date,
      poster_url,
      circuit,
      winner,
      location,
      country,
      created_at,
      updated_at
    `)
    .in('race_id', logs.map(log => log.match_id))
    .order('race_date', { ascending: false });

  if (racesError) {
    console.error('Error fetching races:', racesError);
    return [];
  }

  console.log('Found races:', races);
  return races || [];
}

interface ProfilePageProps {
  params: {
    username: string;
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  // Add debug logging
  console.log('Debug info:');
  const debug = await debugUserProfile(params.username);
  console.log('Debug result:', JSON.stringify(debug, null, 2));

  const profile = await getProfileStats(params.username);
  console.log('Profile data:', profile);
  
  if (!profile) {
    notFound();
  }

  const recentRaces = await getRecentRaces(profile.id);
  console.log('Recent races:', recentRaces);

  return (
    <div className="min-h-screen bg-hala-dark">
      <Navbar />
      <ProfileHeader profile={profile} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RecentActivity recentRaces={recentRaces} />
      </main>
    </div>
  );
} 