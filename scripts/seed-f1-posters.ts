import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Supabase client with service role key
const supabaseUrl = 'https://kccrodkrjyicumgnlkaj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjY3JvZGtyanlpY3VtZ25sa2FqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDI3MDAyNywiZXhwIjoyMDY1ODQ2MDI3fQ.sVREV8x-Pt2GTqmt7LGNSSZVPmzxU0mSGSq8i9u0I5g';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  }
});

interface PosterData {
  round: number;
  url: string;
  local_path: string;
  width: number;
  height: number;
}

async function main() {
  try {
    // First, get our race data from the database
    const { data: races, error: racesError } = await supabase
      .from('f1_races')
      .select('race_id, race_name, round')
      .eq('year', 2024)
      .order('round', { ascending: true });

    if (racesError) {
      throw new Error(`Failed to fetch races: ${racesError.message}`);
    }

    if (!races || races.length === 0) {
      throw new Error('No races found in database');
    }

    console.log(`Found ${races.length} races in database`);

    // Read the poster metadata
    const metadataPath = join(__dirname, 'api-logs', 'f1-posters-2024.json');
    const posterData = JSON.parse(readFileSync(metadataPath, 'utf-8')) as PosterData[];

    console.log(`Found ${posterData.length} posters in metadata`);

    // Update each race with its poster URL
    for (const race of races) {
      const poster = posterData.find(p => p.round === race.round);
      if (!poster) {
        console.warn(`No poster found for race ${race.round}: ${race.race_name}`);
        continue;
      }

      console.log(`Updating race ${race.round}: ${race.race_name} with poster URL`);
      const { error: updateError } = await supabase
        .from('f1_races')
        .update({ poster_url: poster.url })
        .eq('race_id', race.race_id);

      if (updateError) {
        console.error(`Failed to update race ${race.round}:`, updateError);
      } else {
        console.log(`✓ Updated race ${race.round}`);
      }

      // Add a small delay between updates
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\nFinished updating race posters');
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error); 