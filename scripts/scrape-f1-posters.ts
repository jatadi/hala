import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get year from command line argument or use current year
const year = process.argv.includes('--year') 
  ? parseInt(process.argv[process.argv.indexOf('--year') + 1]) 
  : new Date().getFullYear();

if (isNaN(year) || year < 1950 || year > 2100) {
  console.error('Invalid year. Please provide a valid year between 1950 and 2100.');
  process.exit(1);
}

async function downloadImage(url: string, filename: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://formulaonestuff.com/',
    }
  });

  if (!response.ok) throw new Error(`Failed to download image: ${response.statusText}`);
  
  const arrayBuffer = await response.arrayBuffer();
  writeFileSync(filename, Buffer.from(arrayBuffer));
}

interface ImageData {
  src: string;
  width: number;
  height: number;
  class?: string;
  id?: string;
  alt?: string;
  naturalWidth?: number;
  naturalHeight?: number;
}

async function main() {
  // Create output directories if they don't exist
  const outputDir = join(__dirname, 'api-logs', `f1-posters-${year}`);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  try {
    console.log(`Scraping F1 posters for ${year}...`);
    
    // Try different URLs - the site structure might vary by year
    const urls = [
      `https://formulaonestuff.com/${year}-f1-ferrari-cover-art-race-posters.php`,
      `https://formulaonestuff.com/${year}-f1-race-posters.php`,
      `https://formulaonestuff.com/${year}-formula-1-race-posters.php`
    ];

    let allImages: ImageData[] = [];
    
    for (const url of urls) {
      try {
        console.log(`Trying URL: ${url}`);
        await page.goto(url);
        await page.waitForLoadState('networkidle');

        // Take a screenshot for debugging
        await page.screenshot({ path: join(__dirname, 'api-logs', `posters-page-${year}.png`) });

        // Get all images with natural dimensions
        const images = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('img')).map(img => ({
            src: img.src,
            width: img.width,
            height: img.height,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            class: img.className,
            id: img.id,
            alt: img.alt
          }));
        });

        if (images.length > 0) {
          allImages = images;
          console.log(`Found ${images.length} images on ${url}`);
          break; // Stop if we found images
        }
      } catch (error) {
        console.log(`Failed to fetch ${url}:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }

    if (allImages.length === 0) {
      throw new Error(`No images found for year ${year}`);
    }

    console.log('All images found:', allImages.length);
    console.log('Image details:', JSON.stringify(allImages, null, 2));

    // Apply filters with more flexible criteria
    const images = allImages.filter(img => {
      // Clean the URL by removing query parameters
      const cleanUrl = img.src.split('?')[0];
      
      const isValidImage = (
        // Either from resources directory or external URLs
        (cleanUrl.includes('resources/') || cleanUrl.includes('redd.it/')) && 
        // Must be an image file (check both clean URL and original URL for webp)
        (cleanUrl.toLowerCase().match(/\.(jpe?g|png)$/i) || img.src.includes('webp')) &&
        // Must be from the specified year
        img.src.includes(year.toString()) &&
        // Must be a race poster
        (
          img.src.toLowerCase().includes('ferrari') ||
          img.src.toLowerCase().includes('race') ||
          img.src.toLowerCase().includes('poster') ||
          img.src.toLowerCase().includes('grand prix')
        ) &&
        // Exclude specific images
        !cleanUrl.includes('cover-art') &&
        !cleanUrl.includes('thumb') &&
        // Must be a reasonable size
        ((img.naturalWidth ?? 0) > 300 || img.width > 300)
      );
      
      if (!isValidImage) {
        console.log('Filtered out:', img.src, `(width: ${img.width}, height: ${img.height}, natural: ${img.naturalWidth}x${img.naturalHeight})`);
      } else {
        console.log('Accepted:', img.src, `(width: ${img.width}, height: ${img.height}, natural: ${img.naturalWidth}x${img.naturalHeight})`);
      }
      
      return isValidImage;
    });

    console.log(`After filtering, found ${images.length} poster images`);
    console.log('Filtered images:', JSON.stringify(images, null, 2));

    // Sort images by their numeric prefix to maintain race order
    const sortedImages = images.sort((a, b) => {
      const getNumber = (url: string) => {
        // Clean the URL first
        const cleanUrl = url.split('?')[0];
        
        // Try different patterns for extracting race numbers
        const patterns = [
          /\/(\d+)\s/, // Pattern: "/number "
          /RACE\s+(\d+)/, // Pattern: "RACE number"
          /(\d+)\s+${year}/, // Pattern: "number YEAR"
          /round-(\d+)/, // Pattern: "round-number"
          /RACE%20(\d+)/, // URL encoded "RACE number"
          /(\d+)%20${year}/, // URL encoded "number YEAR"
          /(\d+)%20F1/, // URL encoded "number F1"
          /(\d+)%20FERRARI/, // URL encoded "number FERRARI"
          /RACE%20(\d+)/, // URL encoded space
          /(\d+)%20/, // Any number followed by encoded space
        ];

        for (const pattern of patterns) {
          const match = cleanUrl.match(pattern) || url.match(pattern);
          if (match) {
            return parseInt(match[1]);
          }
        }
        return 0;
      };

      const aNum = getNumber(a.src);
      const bNum = getNumber(b.src);
      
      if (aNum === bNum) {
        // If numbers are the same or not found, try to sort by date in filename
        const getDate = (url: string) => {
          const match = url.match(/(\d{2}-\d{2})/);
          return match ? match[1] : '';
        };
        return getDate(a.src).localeCompare(getDate(b.src));
      }
      
      return aNum - bNum;
    });

    // Add logging for sorted images
    console.log('\nSorted images:');
    sortedImages.forEach((img, i) => {
      console.log(`${i + 1}. ${img.src}`);
    });

    const posterData = [];
    
    for (let i = 0; i < sortedImages.length; i++) {
      const image = sortedImages[i];
      const round = i + 1;
      
      // Clean the URL for filename extraction
      const cleanUrl = image.src.split('?')[0];
      
      // Extract race name from URL if possible
      const nameMatch = cleanUrl.match(/poster\s+([a-z\s]+)\.(jpe?g|png|webp)/i);
      const raceName = nameMatch ? nameMatch[1].trim() : `round-${round}`;
      
      const filename = join(outputDir, `round-${round}-${raceName.toLowerCase().replace(/\s+/g, '-')}.jpg`);
      
      console.log(`Downloading poster ${round}/${sortedImages.length}: ${raceName} (${image.src})`);
      await downloadImage(image.src, filename);
      
      posterData.push({
        round,
        race_name: raceName,
        url: image.src,
        local_path: filename,
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height
      });
    }

    // Save metadata
    const metadataPath = join(__dirname, 'api-logs', `f1-posters-${year}.json`);
    writeFileSync(metadataPath, JSON.stringify(posterData, null, 2));
    
    console.log(`Successfully downloaded ${posterData.length} posters`);
    console.log('Metadata saved to:', metadataPath);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

main().catch(console.error); 