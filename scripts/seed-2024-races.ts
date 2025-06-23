import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import slugify from 'slugify';
import { createClient } from '@supabase/supabase-js';

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

interface RaceData {
  round: string;
  race_name: string;
  year: number;
  race_date: string;
  poster_url: string;
  circuit: string;
  winner: string | null;
  country: string;
  location?: string;
}

// Function to properly format race name
function formatRaceName(name: string): string {
  // Split by spaces and capitalize first letter of each word
  return name
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      // Always capitalize first letter
      if (index === 0 && word.toLowerCase() === 'formula') {
        return 'Formula';
      }
      // Keep certain words lowercase
      if (['de', 'del', 'of', 'and', 'e'].includes(word.toLowerCase())) {
        return word.toLowerCase();
      }
      // Capitalize first letter of other words
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

const seedRaces = async () => {
  try {
    

    // Read the JSON file
    const jsonPath = join(__dirname, 'api-logs', 'combined-race-data-2023.json');
    const raceData: RaceData[] = JSON.parse(readFileSync(jsonPath, 'utf-8'));
    
    console.log(`Found ${raceData.length} races to process`);

    // Process each race
    for (const race of raceData) {
      // Format the race name
      const formattedName = formatRaceName(race.race_name);
      
      // Create ext_id using slugify
      const ext_id = `${race.year}-${slugify(formattedName, { lower: true })}`;

      // Transform race data to match table structure
      const matchData = {
        sport: 'f1',
        ext_id,
        title: formattedName,
        starts_at: new Date(race.race_date),
        poster_url: race.poster_url || '',
        meta: {
          circuit: race.circuit,
          winner: race.winner,
          country: race.country,
          round: parseInt(race.round)
        }
      };

      // Insert into Supabase
      const { error } = await supabase
        .from('matches')
        .insert([matchData]);

      if (error) {
        console.error(`Error inserting ${ext_id}:`, error);
      } else {
        console.log(`Successfully inserted ${ext_id}`);
      }

      // Add a small delay between insertions
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\nSeeding complete!');

    // Verify the insertions
    const { data: insertedRaces, error: queryError } = await supabase
      .from('matches')
      .select('*')
      .eq('sport', 'f1')
      .order('starts_at');

    if (queryError) {
      console.error('Error verifying insertions:', queryError);
    } else {
      console.log(`\nVerification: Found ${insertedRaces.length} F1 races in database`);
    }

  } catch (error) {
    console.error('Error seeding races:', error);
    process.exit(1);
  }
};

// Run the seeding
seedRaces(); 