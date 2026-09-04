const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Simple, standard ICO encoder for PNG-compressed ICO files
function createIco(pngBuffers) {
  const numImages = pngBuffers.length;
  const headerSize = 6 + (16 * numImages);
  let totalDataSize = 0;
  for (const item of pngBuffers) {
    totalDataSize += item.buffer.length;
  }
  const icoBuffer = Buffer.alloc(headerSize + totalDataSize);
  
  // ICONDIR header
  icoBuffer.writeUInt16LE(0, 0); // Reserved, must be 0
  icoBuffer.writeUInt16LE(1, 2); // Image type: 1 = ICO
  icoBuffer.writeUInt16LE(numImages, 4); // Number of images

  let currentOffset = headerSize;
  for (let i = 0; i < numImages; i++) {
    const { width, height, buffer } = pngBuffers[i];
    const entryOffset = 6 + (i * 16);
    icoBuffer.writeUInt8(width >= 256 ? 0 : width, entryOffset); // Width
    icoBuffer.writeUInt8(height >= 256 ? 0 : height, entryOffset + 1); // Height
    icoBuffer.writeUInt8(0, entryOffset + 2); // Color palette
    icoBuffer.writeUInt8(0, entryOffset + 3); // Reserved
    icoBuffer.writeUInt16LE(1, entryOffset + 4); // Color planes
    icoBuffer.writeUInt16LE(32, entryOffset + 6); // Bits per pixel
    icoBuffer.writeUInt32LE(buffer.length, entryOffset + 8); // Image data size
    icoBuffer.writeUInt32LE(currentOffset, entryOffset + 12); // Offset of data

    buffer.copy(icoBuffer, currentOffset);
    currentOffset += buffer.length;
  }

  return icoBuffer;
}

async function buildBrandIcons() {
  console.log('Generating SPECTRA luxury brand icons...');

  // 1. Extract the raw S from the logo
  const { data: origData, info } = await sharp('public/logo/logo.png')
    .extract({ left: 35, top: 15, width: 157, height: 139 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Extract rotated version to fix the slight top-left edge clip in the source image
  const { data: rotData } = await sharp('public/logo/logo.png')
    .extract({ left: 35, top: 15, width: 157, height: 139 })
    .rotate(180)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: sW, height: sH, channels } = info;
  const symmetricData = Buffer.alloc(sW * sH * channels);

  for (let i = 0; i < sW * sH; i++) {
    const idx = i * channels;
    const a1 = channels === 4 ? origData[idx + 3] : 255;
    const a2 = channels === 4 ? rotData[idx + 3] : 255;
    const r1 = origData[idx], r2 = rotData[idx];
    const g1 = origData[idx + 1], g2 = rotData[idx + 1];
    const b1 = origData[idx + 2], b2 = rotData[idx + 2];

    const maxA = Math.max(a1, a2);
    symmetricData[idx] = Math.max(r1, r2);
    symmetricData[idx + 1] = Math.max(g1, g2);
    symmetricData[idx + 2] = Math.max(b1, b2);
    if (channels === 4) {
      symmetricData[idx + 3] = maxA;
    }
  }

  // 2. Resize the symmetric S glyph to 300x266 for the 512x512 badge
  const sGlyph = await sharp(symmetricData, { raw: { width: sW, height: sH, channels } })
    .resize(304, 269, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  // 3. Create high-resolution 512x512 luxury background badge
  const svgBackground = `
  <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#141414" />
        <stop offset="40%" stop-color="#0a0a0a" />
        <stop offset="100%" stop-color="#020202" />
      </linearGradient>

      <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FCE5B5" stop-opacity="0.95" />
        <stop offset="25%" stop-color="#C8874A" stop-opacity="0.75" />
        <stop offset="50%" stop-color="#7C4B18" stop-opacity="0.4" />
        <stop offset="75%" stop-color="#C8874A" stop-opacity="0.75" />
        <stop offset="100%" stop-color="#FCE5B5" stop-opacity="0.95" />
      </linearGradient>

      <radialGradient id="goldAura" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#c8874a" stop-opacity="0.18" />
        <stop offset="60%" stop-color="#c8874a" stop-opacity="0.05" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </radialGradient>
    </defs>

    <!-- Main Squircle Body -->
    <rect width="512" height="512" rx="116" fill="url(#bgGrad)" />

    <!-- Subtle Golden Center Radial Aura -->
    <circle cx="256" cy="256" r="230" fill="url(#goldAura)" />

    <!-- Exterior Dark Rim -->
    <rect x="6" y="6" width="500" height="500" rx="110" fill="none" stroke="#222222" stroke-width="2" stroke-opacity="0.8" />

    <!-- Ultra-Luxurious Champagne Gold Inset Border -->
    <rect x="12" y="12" width="488" height="488" rx="104" fill="none" stroke="url(#goldBorder)" stroke-width="3" />
  </svg>
  `;

  // Master 512x512 luxury icon
  const master512 = await sharp(Buffer.from(svgBackground))
    .composite([{
      input: sGlyph,
      top: Math.round((512 - 269) / 2),
      left: Math.round((512 - 304) / 2),
    }])
    .png()
    .toBuffer();

  // Save 512x512
  await sharp(master512).toFile('public/icon-512.png');
  console.log('✓ Created public/icon-512.png');

  // Save 192x192
  const buf192 = await sharp(master512)
    .resize(192, 192, { kernel: 'lanczos3' })
    .png()
    .toFile('public/icon-192.png');
  console.log('✓ Created public/icon-192.png');

  // Save Apple Touch Icon 180x180
  const buf180 = await sharp(master512)
    .resize(180, 180, { kernel: 'lanczos3' })
    .png()
    .toBuffer();
  fs.writeFileSync('public/apple-touch-icon.png', buf180);
  fs.writeFileSync('src/app/apple-icon.png', buf180);
  console.log('✓ Created public/apple-touch-icon.png and src/app/apple-icon.png');

  // Save 48x48
  const buf48 = await sharp(master512)
    .resize(48, 48, { kernel: 'lanczos3' })
    .png()
    .toBuffer();
  fs.writeFileSync('public/favicon-48x48.png', buf48);
  console.log('✓ Created public/favicon-48x48.png');

  // Save 32x32
  const buf32 = await sharp(master512)
    .resize(32, 32, { kernel: 'lanczos3' })
    .png()
    .toBuffer();
  fs.writeFileSync('public/favicon-32x32.png', buf32);
  fs.writeFileSync('src/app/icon.png', buf32);
  console.log('✓ Created public/favicon-32x32.png and src/app/icon.png');

  // Save 16x16
  const buf16 = await sharp(master512)
    .resize(16, 16, { kernel: 'lanczos3' })
    .png()
    .toBuffer();
  fs.writeFileSync('public/favicon-16x16.png', buf16);
  console.log('✓ Created public/favicon-16x16.png');

  // Build standard multi-size ICO (16x16, 32x32, 48x48)
  const icoBuffer = createIco([
    { width: 16, height: 16, buffer: buf16 },
    { width: 32, height: 32, buffer: buf32 },
    { width: 48, height: 48, buffer: buf48 },
  ]);

  fs.writeFileSync('public/favicon.ico', icoBuffer);
  fs.writeFileSync('src/app/favicon.ico', icoBuffer);
  console.log('✓ Created public/favicon.ico and src/app/favicon.ico (multi-resolution ICO)');

  // Also create scalable self-contained SVG favicon
  const b64_192 = (await sharp(master512).resize(192, 192, { kernel: 'lanczos3' }).png().toBuffer()).toString('base64');
  const svgFavicon = `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <image href="data:image/png;base64,${b64_192}" x="0" y="0" width="64" height="64" />
</svg>`.trim();
  fs.writeFileSync('public/favicon.svg', svgFavicon);
  console.log('✓ Created self-contained public/favicon.svg');

  console.log('\nAll SPECTRA favicon and brand icon assets generated flawlessly!');
}

buildBrandIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
