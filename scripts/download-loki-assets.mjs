import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const postersDir = path.join(projectRoot, 'public', 'posters');
const castDir = path.join(projectRoot, 'public', 'cast');

if (!fs.existsSync(postersDir)) fs.mkdirSync(postersDir, { recursive: true });
if (!fs.existsSync(castDir)) fs.mkdirSync(castDir, { recursive: true });

async function downloadFile(url, dest) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CinePrimeSeries/1.0' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(arrayBuffer));
    console.log(`✅ Downloaded ${dest} (${arrayBuffer.byteLength} bytes)`);
    return true;
  } catch (e) {
    console.error(`❌ Failed to download ${url}:`, e.message);
    return false;
  }
}

async function main() {
  console.log('📥 Downloading official Loki and series assets...');

  // 1. Loki Posters
  await downloadFile(
    'https://static.tvmaze.com/uploads/images/original_untouched/478/1195717.jpg',
    path.join(postersDir, 'loki.jpg')
  );

  // TVmaze Loki backdrop or high-res background
  await downloadFile(
    'https://static.tvmaze.com/uploads/images/original_untouched/478/1195718.jpg',
    path.join(postersDir, 'loki-backdrop.jpg')
  );

  // Fallback backdrop if 1195718 not found
  if (!fs.existsSync(path.join(postersDir, 'loki-backdrop.jpg')) || fs.statSync(path.join(postersDir, 'loki-backdrop.jpg')).size < 1000) {
    await downloadFile(
      'https://static.tvmaze.com/uploads/images/medium_landscape/478/1195717.jpg',
      path.join(postersDir, 'loki-backdrop.jpg')
    );
  }

  // 2. Loki Cast
  const castList = [
    { name: 'tom-hiddleston.jpg', url: 'https://static.tvmaze.com/uploads/images/medium_portrait/46/117106.jpg' },
    { name: 'owen-wilson.jpg', url: 'https://static.tvmaze.com/uploads/images/medium_portrait/572/1430173.jpg' },
    { name: 'sophia-di-martino.jpg', url: 'https://static.tvmaze.com/uploads/images/medium_portrait/3/8266.jpg' },
    { name: 'wunmi-mosaku.jpg', url: 'https://static.tvmaze.com/uploads/images/medium_portrait/610/1526544.jpg' },
    { name: 'ke-huy-quan.jpg', url: 'https://static.tvmaze.com/uploads/images/medium_portrait/443/1109033.jpg' },
    { name: 'jonathan-majors.jpg', url: 'https://static.tvmaze.com/uploads/images/medium_portrait/273/683515.jpg' },
    { name: 'gugu-mbatha-raw.jpg', url: 'https://static.tvmaze.com/uploads/images/medium_portrait/520/1301140.jpg' },
    { name: 'tara-strong.jpg', url: 'https://static.tvmaze.com/uploads/images/medium_portrait/11/29961.jpg' }
  ];

  for (const c of castList) {
    await downloadFile(c.url, path.join(castDir, c.name));
  }

  console.log('🎉 Assets download finished!');
}

main();
