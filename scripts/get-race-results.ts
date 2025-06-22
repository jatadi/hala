import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as f1Api from 'f1-api-node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface RaceResult {
  grandPrix: string;
  date: string;
  winner: string;
  car: string;
  laps: number;
  time: string;
}

const getRaceResults = async (year: number = new Date().getFullYear()): Promise<RaceResult[]> => {
  try {
    console.log(`Fetching race results for ${year}...`);
    
    // Get race results from the API
    const results = await f1Api.getRaceResults(year);
    console.log(`Found ${results.length} race results`);

    // Transform the results to match our interface
    const transformedResults: RaceResult[] = results.map(result => ({
      grandPrix: result.grandPrix,
      date: result.date instanceof Date ? result.date.toISOString() : result.date,
      winner: result.winner,
      car: result.car,
      laps: result.laps,
      time: result.time
    }));

    // Save results to file
    const outputPath = join(__dirname, 'api-logs', `race-results-${year}.json`);
    writeFileSync(outputPath, JSON.stringify(transformedResults, null, 2));
    console.log(`\nSaved ${transformedResults.length} results to ${outputPath}`);

    return transformedResults;
  } catch (error) {
    console.error('Error fetching race results:', error);
    throw error;
  }
};

// Run the script
getRaceResults(2024)
  .then(() => console.log('Done!'))
  .catch(error => console.error('Failed:', error)); 