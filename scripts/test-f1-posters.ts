import { chromium, BrowserContext } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

interface PosterData {
  raceName: string;
  posterUrl: string;
  localPath?: string;
}

async function downloadImage(url: string, outputPath: string): Promise<boolean> {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://formulaonestuff.com/'
    };

    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.log('Response not OK:', response.status, response.statusText);
      return false;
    }
    
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength < 1000) {
      console.log('Image too small:', buffer.byteLength, 'bytes');
      return false;
    }
    
    writeFileSync(outputPath, Buffer.from(buffer));
    console.log('Successfully saved image:', outputPath, '(', buffer.byteLength, 'bytes)');
    return true;
  } catch (error) {
    console.error('Error downloading image:', error);
    return false;
  }
}

async function scrapeF1Posters(year: number): Promise<PosterData[]> {
  console.log(`Starting to scrape Ferrari F1 posters for ${year}...`);
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 120000 // 2 minute timeout
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  const results: PosterData[] = [];
  
  try {
    // Visit the posters page
    const postersUrl = `https://formulaonestuff.com/${year}-f1-ferrari-cover-art-race-posters.php`;
    console.log('Visiting posters page:', postersUrl);
    await page.goto(postersUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Take a screenshot
    await page.screenshot({ path: join(__dirname, 'api-logs', `ferrari-posters-${year}.png`) });
    
    // Get all image links
    const imageLinks = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.map(img => ({
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt') || '',
        width: img.width,
        height: img.height
      })).filter(img => 
        img.src && 
        (img.src.includes('.jpg') || img.src.includes('.png')) &&
        img.width > 100 && // Skip tiny images
        img.height > 100
      );
    });

    console.log(`Found ${imageLinks.length} potential poster images`);
    
    // Create posters directory if it doesn't exist
    const postersDir = join(__dirname, 'api-logs', 'ferrari-posters');
    try {
      mkdirSync(postersDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }
    
    // Download each image
    for (const [index, img] of imageLinks.entries()) {
      try {
        if (!img.src) continue;
        
        // Make sure we have the full URL
        const imageUrl = new URL(img.src, 'https://formulaonestuff.com').href;
        console.log(`\nProcessing image ${index + 1}/${imageLinks.length}`);
        console.log('URL:', imageUrl);
        
        // Generate a filename from the URL or alt text
        const filename = img.alt
          ? `${year}-${img.alt.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.jpg`
          : `${year}-ferrari-poster-${index + 1}.jpg`;
        
        const outputPath = join(postersDir, filename);
        
        const success = await downloadImage(imageUrl, outputPath);
        
        if (success) {
          console.log(`Successfully downloaded poster!`);
          results.push({
            raceName: img.alt || `Poster ${index + 1}`,
            posterUrl: imageUrl,
            localPath: outputPath
          });
        } else {
          console.log(`Failed to download poster`);
        }
        
        // Wait between downloads
        await page.waitForTimeout(2000);
        
      } catch (error) {
        console.error(`Error processing image:`, error);
      }
    }
    
    // Save results to file
    const outputPath = join(__dirname, 'api-logs', `ferrari-posters-${year}.json`);
    writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\nSaved ${results.length} posters to: ${outputPath}`);
    
    return results;
  } catch (error) {
    console.error('Error scraping posters:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function main() {
  const year = 2024;
  
  try {
    const posters = await scrapeF1Posters(year);
    console.log('Scraping complete!');
    console.log('\nFound posters:');
    posters.forEach(p => {
      console.log(`- ${p.raceName}: ${p.posterUrl}`);
      if (p.localPath) {
        console.log(`  Saved to: ${p.localPath}`);
      }
    });
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
}

main(); 