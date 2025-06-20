import { getAllF1Races, getRaceDetails } from '@/lib/supabase/queries/races';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get all races
    const allRaces = await getAllF1Races();
    console.log('All races:', allRaces);

    // If we have any races, try to get details for the first one
    if (allRaces.length > 0) {
      const firstRaceDetails = await getRaceDetails(allRaces[0].race_id);
      console.log('First race details:', firstRaceDetails);
    }

    return NextResponse.json({
      success: true,
      races: allRaces
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 