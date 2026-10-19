import sharp from 'sharp';

async function generateCourtPoster() {
  const width = 800;
  const height = 1200;

  // 1. Center crop characters
  const centerBuffer = await sharp('./public/posters/court-promo-1.jpg')
    .extract({ left: 240, top: 0, width: 800, height: 720 })
    .resize(width, height, { fit: 'cover', position: 'top' })
    .toBuffer();

  // 2. Extract logo from bottom right of original
  const rawLogo = await sharp('./public/posters/court-promo-1.jpg')
    .extract({ left: 915, top: 540, width: 360, height: 165 })
    .resize(500, null)
    .toBuffer();

  const logoMeta = await sharp(rawLogo).metadata();
  const lw = logoMeta.width;
  const lh = logoMeta.height;

  // 3. Create a dark gradient banner that smoothly fades to pure black
  const svgOverlay = Buffer.from(`
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#000000" stop-opacity="0" />
          <stop offset="60%" stop-color="#04060a" stop-opacity="0.1" />
          <stop offset="78%" stop-color="#04060a" stop-opacity="0.85" />
          <stop offset="88%" stop-color="#04060a" stop-opacity="1" />
          <stop offset="100%" stop-color="#04060a" stop-opacity="1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)" />
    </svg>
  `);

  const logoLeft = Math.round((width - lw) / 2);
  const logoTop = height - lh - 40;

  await sharp(centerBuffer)
    .composite([
      { input: svgOverlay, top: 0, left: 0 },
      { input: rawLogo, top: logoTop, left: logoLeft, blend: 'screen' }
    ])
    .jpeg({ quality: 95 })
    .toFile('./public/posters/the-court-poster.jpg');

  console.log('✅ Generated screen-blended ./public/posters/the-court-poster.jpg');
}

generateCourtPoster();
