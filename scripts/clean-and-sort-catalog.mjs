import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import { MongoClient } from 'mongodb';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Load .env.local
const envPath = path.join(projectRoot, '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      process.env[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim();
    }
  }
}

const CATALOG_PATH = path.join(projectRoot, 'data', 'catalog.json');
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'CinePrimeSeries';

// Sticker and non-video message IDs from Telegram audit
const stickerIds = new Set([
  361, 354, 347, 340, 339, 332, 325, 318, 317, 310, 303, 296, 295, 288, 281,
  274, 273, 266, 259, 252, 251, 244, 237, 230, 229, 222, 215, 208, 207, 200,
  197, 194, 193, 186, 179, 172, 171, 164, 157, 150, 149, 142, 135, 128, 127,
  120, 113,
]);

function getBatchInfo(file) {
  const name = file.fileName;
  // Match combined EP (start-end)
  const combMatch = name.match(/EP\s*\(\s*(\d+)\s*[- ]\s*(\d+)\s*\)/i);
  if (combMatch) {
    const startEp = parseInt(combMatch[1], 10);
    const endEp = parseInt(combMatch[2], 10);
    const qRank = file.quality === '1080P' ? 3 : file.quality === '720P' ? 2 : 1;
    return {
      batchNum: endEp,
      isCombined: true,
      epNum: endEp,
      subRank: 10 + qRank, // higher means first in batch
    };
  }
  // Match single episode S03Exx
  const epMatch = name.match(/S\d+E(\d+)/i);
  if (epMatch) {
    const epNum = parseInt(epMatch[1], 10);
    const batchNum = Math.ceil(epNum / 4) * 4;
    return {
      batchNum,
      isCombined: false,
      epNum,
      subRank: epNum, // single episodes sorted descending by episode number
    };
  }
  return { batchNum: 0, isCombined: false, epNum: 0, subRank: 0 };
}

function sortFilesLatestFirst(list) {
  return [...list].sort((a, b) => {
    const infoA = getBatchInfo(a);
    const infoB = getBatchInfo(b);

    // 1. Highest batch number first (e.g. 48 before 44 before 40... down to 04)
    if (infoA.batchNum !== infoB.batchNum) {
      return infoB.batchNum - infoA.batchNum;
    }
    // 2. Within same batch: Combined files first (1080P > 720P > 480P)
    if (infoA.isCombined && !infoB.isCombined) return -1;
    if (!infoA.isCombined && infoB.isCombined) return 1;
    // 3. Sub-rank within category
    return infoB.subRank - infoA.subRank;
  });
}

async function cleanAndSortCatalog() {
  console.log('🔄 Cleaning stickers and ordering files (Latest to 1st)...');

  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const series = catalog[0];

  const rawFiles = series.files || [];
  console.log(`📊 Total raw files before cleaning: ${rawFiles.length}`);

  // Filter out stickers and non-video files
  const realVideos = rawFiles.filter(
    (f) => !stickerIds.has(f.channelMessageId) && !f.fileName.includes('File #')
  );

  console.log(`✅ Extracted ${realVideos.length} genuine video files (removed ${rawFiles.length - realVideos.length} stickers).`);

  // Sort: Latest to 1st (Combined 1080p, 720p, 480p, then single episodes E48..E45, etc.)
  const sortedFiles = sortFilesLatestFirst(realVideos);

  series.files = sortedFiles;
  series.numberOfEpisodes = sortedFiles.length;
  if (series.seasons && series.seasons[0]) {
    series.seasons[0].episodeCount = sortedFiles.length;
  }

  // Save to catalog.json
  fs.writeFileSync(CATALOG_PATH, JSON.stringify([series], null, 2), 'utf8');
  console.log(`💾 Saved ${sortedFiles.length} ordered files to data/catalog.json!`);

  // Sync to MongoDB Atlas
  if (MONGODB_URI) {
    try {
      console.log('🔌 Connecting to MongoDB Atlas...');
      const client = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 8000,
        family: 4,
      });
      await client.connect();
      const db = client.db(MONGODB_DATABASE);

      await db.collection('series').deleteMany({});
      await db.collection('series').insertOne(series);

      await db.collection('files').deleteMany({});
      await db.collection('files').insertMany(sortedFiles);

      console.log(`🎉 [MongoDB Atlas Synced] Stored 1 series & ${sortedFiles.length} clean, sorted files in MongoDB!`);
      await client.close();
    } catch (e) {
      console.warn('MongoDB sync notice:', e.message);
    }
  }

  console.log('\nTop 10 files in catalog:');
  sortedFiles.slice(0, 10).forEach((f, i) => {
    console.log(`  ${i + 1}. [${f.quality}] ${f.fileName} (Msg #${f.channelMessageId})`);
  });
}

cleanAndSortCatalog();
