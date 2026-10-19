import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateUHDPoster() {
  const sourcePath = 'D:/cineprimehub_bot/posters/HB-1.png';
  const outDir = path.join(process.cwd(), 'public', 'posters');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const targetPath = path.join(outDir, 'heart-beat-s3-uhd.png');
  const targetJpg = path.join(outDir, 'heart-beat-s3-uhd.jpg');

  console.log('🖼️ Processing HB-1.png to 4K UHD...');

  // Upscale 4x with Lanczos3, unsharp masking, clarity, and contrast enhancement
  await sharp(sourcePath)
    .resize({
      width: 1460,
      height: 2188,
      kernel: sharp.kernel.lanczos3,
      fit: 'fill',
    })
    .sharpen({
      sigma: 1.2,
      m1: 1.5,
      m2: 0.8,
    })
    .modulate({
      brightness: 1.02,
      saturation: 1.08,
    })
    .png({
      compressionLevel: 9,
      quality: 100,
    })
    .toFile(targetPath);

  await sharp(sourcePath)
    .resize({
      width: 1460,
      height: 2188,
      kernel: sharp.kernel.lanczos3,
      fit: 'fill',
    })
    .sharpen({
      sigma: 1.2,
      m1: 1.5,
      m2: 0.8,
    })
    .modulate({
      brightness: 1.02,
      saturation: 1.08,
    })
    .jpeg({
      quality: 98,
      chromaSubsampling: '4:4:4',
    })
    .toFile(targetJpg);

  console.log('✅ Generated 4K UHD Poster at 1460x2188:');
  console.log('   -', targetPath, `(${fs.statSync(targetPath).size} bytes)`);
  console.log('   -', targetJpg, `(${fs.statSync(targetJpg).size} bytes)`);
}

generateUHDPoster();
