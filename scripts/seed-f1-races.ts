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

interface RaceData {
  round: string;
  date: string;
  raceCountry: string;
  circuit: string;
  eventTitle: string;
  winner: string;
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

// Function to parse date string into a Date object
function parseRaceDate(dateStr: string, year: number): Date {
  // Extract the end date (last part) from formats like "03 - 05 Mar" or "31 Mar - 02 Apr"
  const parts = dateStr.split('-').map(p => p.trim());
  const endDate = parts[parts.length - 1];
  
  // Parse the end date which contains the month
  const [day, month] = endDate.split(' ');
  
  // Create date string in ISO format
  const dateString = `${year}-${month}-${day.padStart(2, '0')}`;
  const date = new Date(dateString);
  
  // Add time component (most F1 races start at 14:00 UTC)
  date.setUTCHours(14, 0, 0, 0);
  
  return date;
}

const seedRaces = async (year: number, filePath?: string) => {
  try {
    // Use provided file path or construct default path
    const jsonPath = filePath || join(__dirname, 'api-logs', `combined-race-data-${year}.json`);
    console.log(`Reading race data from: ${jsonPath}`);
    
    // Read and parse the JSON file
    const raceData: RaceData[] = JSON.parse(readFileSync(jsonPath, 'utf-8'));
    console.log(`Found ${raceData.length} races to process for ${year}`);

    // First verify the data - using extract(year from starts_at) instead of year column
    const { data: existingRaces, error: checkError } = await supabase
      .from('matches')
      .select('ext_id')
      .eq('sport', 'f1')
      .gte('starts_at', `${year}-01-01`)
      .lt('starts_at', `${year + 1}-01-01`);

    if (checkError) {
      console.error('Error checking existing races:', checkError);
      return;
    }

    const existingExtIds = new Set(existingRaces?.map(r => r.ext_id));
    let inserted = 0, skipped = 0;

    // Process each race
    for (const race of raceData) {
      // Format the race name
      const formattedName = formatRaceName(race.eventTitle);
      
      // Create ext_id using slugify
      const ext_id = `${year}-${slugify(formattedName, { lower: true })}`;

      // Skip if race already exists
      if (existingExtIds.has(ext_id)) {
        console.log(`Skipping ${ext_id} - already exists`);
        skipped++;
        continue;
      }

      // Transform race data to match table structure
      const matchData = {
        sport: 'f1',
        ext_id,
        title: formattedName,
        starts_at: parseRaceDate(race.date, year),
        meta: {
          circuit: race.circuit,
          winner: race.winner,
          country: race.raceCountry,
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
        inserted++;
      }

      // Add a small delay between insertions
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\nSeeding complete for ${year}!`);
    console.log(`Inserted: ${inserted}, Skipped: ${skipped}`);

    // Verify the insertions using date range instead of year
    const { data: verifyRaces, error: verifyError } = await supabase
      .from('matches')
      .select('*')
      .eq('sport', 'f1')
      .gte('starts_at', `${year}-01-01`)
      .lt('starts_at', `${year + 1}-01-01`)
      .order('starts_at');

    if (verifyError) {
      console.error('Error verifying insertions:', verifyError);
    } else {
      console.log(`\nVerification: Found ${verifyRaces.length} F1 races for ${year} in database`);
    }

  } catch (error) {
    console.error('Error seeding races:', error);
    process.exit(1);
  }
};

// Get year from command line argument or exit
const year = parseInt(process.argv[2]);
if (!year || isNaN(year) || year < 1950 || year > 2100) {
  console.error('Please provide a valid year as argument (e.g., npm run seed-races 2023)');
  process.exit(1);
}

// Run the seeding
seedRaces(year); 