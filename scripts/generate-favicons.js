const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'public', 'logo', 'SPECTRA S LOGO-02.jpg.jpeg');

// The original image is 4501x4500.
// The white emblem is centered at (2251, 2250) with width 2060, height 1020.
// Let crop size be 2560x2560 so the emblem occupies ~80% of width with elegant luxury breathing room.
const cropSize = 2560;
const cropLeft = Math.round(2251 - cropSize / 2);
const cropTop = Math.round(2250 - cropSize / 2);

async function generateAll() {
  console.log('Generating favicons from:', srcPath);

  // 1. Create squircle mask helper
  function getSquircleMask(dimension, rx) {
    return Buffer.from(
      `<svg width="${dimension}" height="${dimension}">
        <rect x="0" y="0" width="${dimension}" height="${dimension}" rx="${rx}" ry="${rx}" fill="#fff"/>
      </svg>`
    );
  }

  // Generate standard dimensions:
  // 16x16, 32x32, 48x48, 64x64, 180x180 (apple-touch-icon), 192x192, 512x512
  const targets = [
    { file: 'public/favicon-16x16.png', size: 16, rx: 3 },
    { file: 'public/favicon-32x32.png', size: 32, rx: 7 },
    { file: 'public/favicon-48x48.png', size: 48, rx: 10 },
    { file: 'public/apple-touch-icon.png', size: 180, rx: 40 },
    { file: 'src/app/apple-icon.png', size: 180, rx: 40 },
    { file: 'public/icon-192.png', size: 192, rx: 42 },
    { file: 'public/icon-512.png', size: 512, rx: 112 },
    { file: 'src/app/icon.png', size: 512, rx: 112 },
  ];

  for (const t of targets) {
    const outPath = path.join(__dirname, '..', t.file);
    const mask = getSquircleMask(t.size, t.rx);
    await sharp(srcPath)
      .extract({ left: cropLeft, top: cropTop, width: cropSize, height: cropSize })
      .resize(t.size, t.size, { fit: 'cover' })
      .composite([{ input: mask, blend: 'dest-in' }])
      .png()
      .toFile(outPath);
    console.log(`Generated: ${t.file} (${t.size}x${t.size})`);
  }

  // Also generate square unmasked versions for crisp favicons / ICO
  // Generate multi-size ICO:
  // In ICO format, sharp can write .png or we can create an ICO file.
  // Next.js and modern browsers accept 32x32 or 48x48 PNG directly inside .ico or as favicon.ico
  // To ensure 100% browser compatibility, generate a 32x32 / 48x48 favicon.ico
  const ico32Buffer = await sharp(srcPath)
    .extract({ left: cropLeft, top: cropTop, width: cropSize, height: cropSize })
    .resize(32, 32)
    .composite([{ input: getSquircleMask(32, 7), blend: 'dest-in' }])
    .png()
    .toBuffer();

  const ico48Buffer = await sharp(srcPath)
    .extract({ left: cropLeft, top: cropTop, width: cropSize, height: cropSize })
    .resize(48, 48)
    .composite([{ input: getSquircleMask(48, 10), blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Create a proper binary .ico container wrapping 16, 32, 48 PNG frames
  function createIco(pngBuffers) {
    const numImages = pngBuffers.length;
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // reserved
    header.writeUInt16LE(1, 2); // type 1 = ICO
    header.writeUInt16LE(numImages, 4);

    const dirEntrySize = 16;
    let offset = 6 + (numImages * dirEntrySize);
    const dirEntries = [];

    for (const { size, buf } of pngBuffers) {
      const entry = Buffer.alloc(dirEntrySize);
      entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
      entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
      entry.writeUInt8(0, 2); // color palette
      entry.writeUInt8(0, 3); // reserved
      entry.writeUInt16LE(1, 4); // color planes
      entry.writeUInt16LE(32, 6); // bits per pixel
      entry.writeUInt32LE(buf.length, 8); // size of image data
      entry.writeUInt32LE(offset, 12); // offset of image data
      dirEntries.push(entry);
      offset += buf.length;
    }

    return Buffer.concat([
      header,
      ...dirEntries,
      ...pngBuffers.map(p => p.buf)
    ]);
  }

  const ico16Buffer = await sharp(srcPath)
    .extract({ left: cropLeft, top: cropTop, width: cropSize, height: cropSize })
    .resize(16, 16)
    .composite([{ input: getSquircleMask(16, 3), blend: 'dest-in' }])
    .png()
    .toBuffer();

  const icoData = createIco([
    { size: 16, buf: ico16Buffer },
    { size: 32, buf: ico32Buffer },
    { size: 48, buf: ico48Buffer }
  ]);

  fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.ico'), icoData);
  fs.writeFileSync(path.join(__dirname, '..', 'src', 'app', 'favicon.ico'), icoData);
  console.log('Generated: public/favicon.ico and src/app/favicon.ico');

  // Also update public/favicon.svg with the embedded 64px base64 of the new emblem
  const svg64Png = await sharp(srcPath)
    .extract({ left: cropLeft, top: cropTop, width: cropSize, height: cropSize })
    .resize(64, 64)
    .composite([{ input: getSquircleMask(64, 14), blend: 'dest-in' }])
    .png()
    .toBuffer();

  const svgContent = `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">\n  <image href="data:image/png;base64,${svg64Png.toString('base64')}" x="0" y="0" width="64" height="64" />\n</svg>\n`;
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.svg'), svgContent);
  console.log('Generated: public/favicon.svg');

  console.log('All favicons successfully generated!');
}

generateAll().catch(err => {
  console.error(err);
  process.exit(1);
});
