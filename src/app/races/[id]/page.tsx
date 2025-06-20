import { Navbar } from '@/components/navbar';
import { RaceHeader } from '@/components/race/RaceHeader';
import { getRaceDetails } from '@/lib/supabase/queries/races';
import { notFound } from 'next/navigation';

interface RacePageProps {
  params: {
    id: string;
  };
}

// Disable caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RacePage({ params }: RacePageProps) {
  const raceId = parseInt(params.id, 10);
  console.log('Attempting to fetch race with ID:', raceId);
  
  try {
    const race = await getRaceDetails(raceId);
    console.log('Race details response:', race);

    if (!race) {
      console.log('Race not found, redirecting to 404');
      notFound();
    }

    return (
      <div className="min-h-screen bg-hala-dark">
        <Navbar />
        <RaceHeader race={race} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching race:', error);
    throw error;
  }
} 