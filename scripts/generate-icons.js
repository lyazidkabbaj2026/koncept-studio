const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = path.join(__dirname, '../public/images/logo.svg');
const outputDir = path.join(__dirname, '../public/images/icons');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  console.log('Generating PWA icons from SVG...');

  for (const size of sizes) {
    try {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

      await sharp(inputSvg)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
        })
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`✗ Error generating ${size}x${size} icon:`, error);
    }
  }

  console.log('Icon generation complete!');
}

generateIcons().catch(console.error);