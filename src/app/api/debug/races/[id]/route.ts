import { supabase } from '@/lib/supabase/client';
import { getRaceDetails } from '@/lib/supabase/queries/races';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);

  try {
    // 1. First check the raw matches table
    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', id)
      .single();

    // 2. Then check the function result using our fixed function
    const functionData = await getRaceDetails(id);

    return NextResponse.json({
      success: true,
      raw_match: {
        data: matchData,
        error: matchError
      },
      function_result: {
        data: functionData,
        error: null
      }
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 