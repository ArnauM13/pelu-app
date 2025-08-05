import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function optimizeAssets() {
  const inputDir = 'src/assets/images';
  const optimizedDir = 'src/assets/images/optimized';
  const responsiveDir = 'src/assets/images/responsive';

  // Create directories if they don't exist
  [optimizedDir, responsiveDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  try {
    const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.png'));

    console.log('🚀 Starting asset optimization...\n');

    for (const file of files) {
      const inputPath = path.join(inputDir, file);
      const baseName = path.basename(file, '.png');
      const originalSize = fs.statSync(inputPath).size;

      console.log(`📸 Processing: ${file} (${(originalSize / 1024).toFixed(1)}KB)`);

      // 1. Create optimized single-size versions
      const optimizedPngPath = path.join(optimizedDir, file);
      const optimizedWebpPath = path.join(optimizedDir, `${baseName}.webp`);

      await sharp(inputPath).png({ quality: 80, compressionLevel: 9 }).toFile(optimizedPngPath);

      await sharp(inputPath).webp({ quality: 80 }).toFile(optimizedWebpPath);

      const optimizedPngSize = fs.statSync(optimizedPngPath).size;
      const optimizedWebpSize = fs.statSync(optimizedWebpPath).size;

      console.log(
        `  ✅ Optimized: PNG ${(optimizedPngSize / 1024).toFixed(1)}KB, WebP ${(optimizedWebpSize / 1024).toFixed(1)}KB`
      );

      // 2. Create responsive versions
      const sizes = [
        { width: 80, suffix: '@1x' },
        { width: 160, suffix: '@2x' },
        { width: 240, suffix: '@3x' },
      ];

      for (const size of sizes) {
        const outputName = `${baseName}${size.suffix}`;
        const pngPath = path.join(responsiveDir, `${outputName}.png`);
        const webpPath = path.join(responsiveDir, `${outputName}.webp`);

        await sharp(inputPath)
          .resize(size.width, null, { withoutEnlargement: true })
          .png({ quality: 80, compressionLevel: 9 })
          .toFile(pngPath);

        await sharp(inputPath)
          .resize(size.width, null, { withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(webpPath);

        const pngSize = fs.statSync(pngPath).size;
        const webpSize = fs.statSync(webpPath).size;

        console.log(
          `  📱 ${outputName}: PNG ${(pngSize / 1024).toFixed(1)}KB, WebP ${(webpSize / 1024).toFixed(1)}KB`
        );
      }

      console.log('');
    }

    console.log('🎉 Asset optimization completed successfully!');
    console.log('\n📁 Generated files:');
    console.log(`  - Optimized: ${optimizedDir}/`);
    console.log(`  - Responsive: ${responsiveDir}/`);
    console.log('\n💡 Use the responsive images with <picture> elements for best performance.');
  } catch (error) {
    console.error('❌ Error optimizing assets:', error);
    process.exit(1);
  }
}

optimizeAssets();
