import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get year from command line argument or use current year
const year = process.argv.includes('--year') 
  ? parseInt(process.argv[process.argv.indexOf('--year') + 1]) 
  : new Date().getFullYear();

if (isNaN(year) || year < 1950 || year > 2100) {
  console.error('Invalid year. Please provide a valid year between 1950 and 2026.');
  process.exit(1);
}

// Create Supabase client with service role key
const supabaseUrl = 'https://kccrodkrjyicumgnlkaj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjY3JvZGtyanlpY3VtZ25sa2FqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDI3MDAyNywiZXhwIjoyMDY1ODQ2MDI3fQ.sVREV8x-Pt2GTqmt7LGNSSZVPmzxU0mSGSq8i9u0I5g';

if (!supabaseKey) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

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
  race_name?: string;
  url: string;
  local_path: string;
  width: number;
  height: number;
}

interface F1Race {
  race_id: number;
  race_name: string;
  round: number;
  poster_url: string | null;
}

async function main() {
  try {
    console.log(`Processing F1 posters for ${year}...`);

    // First, get our race data from the database
    const { data: races, error: racesError } = await supabase
      .from('f1_races')
      .select('race_id, race_name, round, poster_url')
      .gte('race_date', `${year}-01-01`)
      .lt('race_date', `${year + 1}-01-01`)
      .order('round', { ascending: true });

    if (racesError) {
      throw new Error(`Failed to fetch races: ${racesError.message}`);
    }

    if (!races || races.length === 0) {
      throw new Error(`No races found in database for ${year}`);
    }

    console.log(`Found ${races.length} races in database for ${year}`);

    // Read the poster metadata
    const metadataPath = join(__dirname, 'api-logs', `f1-posters-${year}.json`);
    
    if (!readFileSync(metadataPath, 'utf-8').trim()) {
      throw new Error(`Poster metadata file is empty: ${metadataPath}`);
    }

    const posterData = JSON.parse(readFileSync(metadataPath, 'utf-8')) as PosterData[];

    if (!posterData || !Array.isArray(posterData) || posterData.length === 0) {
      throw new Error(`No valid poster data found in ${metadataPath}`);
    }

    console.log(`Found ${posterData.length} posters in metadata`);

    // Verify data consistency
    const maxRound = Math.max(...races.map(r => r.round));
    const maxPosterRound = Math.max(...posterData.map(p => p.round));
    
    if (maxRound !== maxPosterRound) {
      console.warn(`Warning: Mismatch in maximum rounds - Database: ${maxRound}, Posters: ${maxPosterRound}`);
    }

    let updated = 0, skipped = 0, failed = 0;

    // Update each race with its poster URL
    for (const race of races) {
      const poster = posterData.find(p => p.round === race.round);
      
      if (!poster) {
        console.warn(`No poster found for race ${race.round}: ${race.race_name}`);
        skipped++;
        continue;
      }

      // Skip if URL is the same
      if (race.poster_url === poster.url) {
        console.log(`Skipping race ${race.round}: ${race.race_name} - poster URL unchanged`);
        skipped++;
        continue;
      }

      console.log(`Updating race ${race.round}: ${race.race_name} with poster URL`);
      const { error: updateError } = await supabase
        .from('matches')
        .update({ poster_url: poster.url })
        .eq('id', race.race_id);

      if (updateError) {
        console.error(`Failed to update race ${race.round}:`, updateError);
        failed++;
      } else {
        console.log(`✓ Updated race ${race.round}`);
        updated++;
      }

      // Add a small delay between updates
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\nFinished updating race posters');
    console.log(`Summary for ${year}:`);
    console.log(`- Updated: ${updated}`);
    console.log(`- Skipped: ${skipped}`);
    console.log(`- Failed: ${failed}`);
    console.log(`- Total races: ${races.length}`);
    console.log(`- Total posters: ${posterData.length}`);

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error instanceof Error ? error.message : 'Unknown error');
  process.exit(1);
}); 