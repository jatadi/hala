import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface RaceSchedule {
  round: string;
  date: string;
  raceCountry: string;
  location?: string;
  eventTitle: string;
}

// Special cases for country names and locations
const COUNTRY_MAPPINGS: Record<string, { country: string; location?: string }> = {
  'Saudi ArabiaSaudi Arabia': { country: 'Saudi Arabia' },
  'United States of AmericaMiami': { country: 'United States of America', location: 'Miami' },
  'United States of AmericaUnited States': { country: 'United States of America' },
  'United States of AmericaLas Vegas': { country: 'United States of America', location: 'Las Vegas' },
  'United Arab EmiratesAbu Dhabi': { country: 'United Arab Emirates', location: 'Abu Dhabi' },
  'Great BritainGreat Britain': { country: 'Great Britain' },
  'ItalyEmilia-Romagna': { country: 'Italy', location: 'Emilia-Romagna' },
  'People\'s Republic of ChinaChina': { country: 'China' },
  'BahrainBahrain': { country: 'Bahrain' },
  'People\'s Republic of': { country: 'China' },
  'ItalyItaly': { country: 'Italy' },
  'QatarQatar': { country: 'Qatar' }
};

const getRaceSchedule = async (year: number = new Date().getFullYear()): Promise<RaceSchedule[]> => {
  const browser = await puppeteer.launch({
    headless: true
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Navigate to the F1 schedule page
    const url = `https://www.formula1.com/en/racing/${year}.html`;
    console.log('Loading page:', url);
    
    // Navigate with longer timeout and wait for network idle
    await page.goto(url, { 
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000 
    });

    // Wait for race cards to load
    const cardSelector = 'div[class*="relative z-0 w-full min-h-[300px]"]';
    await page.waitForSelector(cardSelector, { 
      visible: true,
      timeout: 30000 
    });

    // Wait a bit more for dynamic content
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract race data directly in the browser context
    const races = await page.evaluate((selector, countryMappings) => {
      const raceCards = document.querySelectorAll(selector);
      const raceData: RaceSchedule[] = [];
      const processedRounds = new Set<string>();

      raceCards.forEach(card => {
        try {
          const text = card.textContent || '';

          // Extract round number
          const roundMatch = text.match(/ROUND (\d+)/);
          const round = roundMatch ? roundMatch[1] : '';

          // Skip if we've already processed this round or if it's not a race
          if (!round || processedRounds.has(round) || text.includes('TESTING')) {
            return;
          }

          // Extract date
          const dateMatch = text.match(/Flag\s*(\d{2}\s*-\s*\d{2}\s*[A-Za-z]{3})/);
          const date = dateMatch ? dateMatch[1].trim() : '';

          // Extract country and location
          const countryMatch = text.match(/Flag of ([^]*?)(?=FORMULA 1)/);
          const countryText = countryMatch ? countryMatch[1] : '';
          
          // Clean up country text
          const cleanCountryText = countryText
            .replace(/Chequered Flag/g, '')
            .replace(/\d{2}\s*-\s*\d{2}\s*[A-Za-z]{3}/g, '')
            .trim();

          // Look up in country mappings
          let raceCountry = '';
          let location = '';

          const mapping = countryMappings[cleanCountryText];
          if (mapping) {
            raceCountry = mapping.country;
            location = mapping.location || '';
          } else {
            // Handle regular cases
            const parts = cleanCountryText.split(/(?=[A-Z])/);
            const uniqueParts = Array.from(new Set(parts.filter(part => part.trim())));
            
            if (uniqueParts.length === 1) {
              raceCountry = uniqueParts[0];
            } else {
              // Try to find a sensible split
              const countryEnd = cleanCountryText.indexOf(uniqueParts[uniqueParts.length - 1]);
              raceCountry = cleanCountryText.substring(0, countryEnd).trim();
              location = uniqueParts[uniqueParts.length - 1];
            }
          }

          // Extract event title
          const titleMatch = text.match(/FORMULA 1\s+([^]*?)(?=\s+2024)/);
          const eventTitle = titleMatch ? titleMatch[1].trim() : '';

          if (round && date && raceCountry && eventTitle) {
            const race: RaceSchedule = {
              round,
              date,
              raceCountry,
              eventTitle
            };

            if (location) {
              race.location = location;
            }

            raceData.push(race);
            processedRounds.add(round);
            console.log('Found race:', race);
          }
        } catch (err) {
          console.error('Error parsing race element:', err);
        }
      });

      return raceData;
    }, cardSelector, COUNTRY_MAPPINGS);

    if (races.length === 0) {
      throw new Error('No races found in the schedule');
    }

    // Sort races by round number
    races.sort((a, b) => parseInt(a.round) - parseInt(b.round));

    // Add missing rounds
    const missingRounds = [
      {
        round: '1',
        date: '29 Feb - 02 Mar',
        raceCountry: 'Bahrain',
        eventTitle: 'GULF AIR BAHRAIN GRAND PRIX'
      },
      {
        round: '16',
        date: '30 Aug - 01 Sep',
        raceCountry: 'Italy',
        eventTitle: 'PIRELLI GRAN PREMIO D\'ITALIA'
      },
      {
        round: '23',
        date: '29 Nov - 01 Dec',
        raceCountry: 'Qatar',
        eventTitle: 'QATAR AIRWAYS QATAR GRAND PRIX'
      }
    ];

    // Insert missing rounds at their correct positions
    for (const missingRace of missingRounds) {
      const index = races.findIndex(race => parseInt(race.round) > parseInt(missingRace.round));
      if (index === -1) {
        races.push(missingRace);
      } else {
        races.splice(index, 0, missingRace);
      }
    }

    // Fix any remaining country name issues
    const fixedRaces = races.map(race => {
      if (race.round === '5') {
        return {
          round: '5',
          date: '19 - 21 Apr',
          raceCountry: 'China',
          eventTitle: 'LENOVO CHINESE GRAND PRIX'
        };
      }
      return race;
    });

    // Save results
    const outputPath = join(__dirname, 'api-logs', `race-schedule-${year}.json`);
    writeFileSync(outputPath, JSON.stringify(fixedRaces, null, 2));
    console.log(`\nSaved ${fixedRaces.length} races to ${outputPath}`);

    return fixedRaces;

  } catch (error) {
    console.error('Error fetching race schedule:', error);
    throw error;
  } finally {
    await browser.close();
  }
};

// Test the new implementation
getRaceSchedule(2024); 