import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

async function main() {
  // Create output directories if they don't exist
  const outputDir = join(__dirname, 'api-logs', 'f1-posters-2024');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  try {
    console.log('Navigating to page...');
    await page.goto('https://formulaonestuff.com/2024-f1-ferrari-cover-art-race-posters.php');
    await page.waitForLoadState('networkidle');

    // Get ALL images first without filtering
    const allImages = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        width: img.width,
        height: img.height,
        class: img.className,
        id: img.id,
        alt: img.alt
      }));
    });

    console.log('All images found:', allImages.length);
    console.log('Image details:', JSON.stringify(allImages, null, 2));

    // Now apply our filters
    const images = allImages.filter(img => 
      img.src.includes('resources/') && 
      (img.src.toLowerCase().includes('.jpg') || img.src.toLowerCase().includes('.jpeg')) &&
      !img.src.includes('thumb') &&
      img.width === 400 && img.height >= 559 // All posters are 400x560
    );

    console.log(`After filtering, found ${images.length} poster images`);
    console.log('Filtered images:', JSON.stringify(images, null, 2));

    // Sort images by their numeric prefix to maintain race order
    const sortedImages = images.sort((a, b) => {
      const getNumber = (url: string) => {
        const match = url.match(/\/(\d+)\s/);
        return match ? parseInt(match[1]) : 0;
      };
      return getNumber(a.src) - getNumber(b.src);
    });

    const posterData = [];
    
    for (let i = 0; i < sortedImages.length; i++) {
      const image = sortedImages[i];
      const round = i + 1;
      
      // Extract race name from URL if possible
      const nameMatch = image.src.match(/poster\s+([a-z\s]+)\.jpe?g/i);
      const raceName = nameMatch ? nameMatch[1].trim() : `round-${round}`;
      
      const filename = join(outputDir, `round-${round}-${raceName.toLowerCase().replace(/\s+/g, '-')}.jpg`);
      
      console.log(`Downloading poster ${round}/${sortedImages.length}: ${raceName}`);
      await downloadImage(image.src, filename);
      
      posterData.push({
        round,
        race_name: raceName,
        url: image.src,
        local_path: filename,
        width: image.width,
        height: image.height
      });
    }

    // Save metadata
    const metadataPath = join(__dirname, 'api-logs', 'f1-posters-2024.json');
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