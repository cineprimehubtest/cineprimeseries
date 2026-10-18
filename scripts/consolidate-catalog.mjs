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
const BOT_USERNAME = (process.env.TELEGRAM_BOT_USERNAME || 'CinePrimeSeries_bot').replace('@', '').trim();
const DB_CHANNEL_ID = process.env.TELEGRAM_DB_CHANNEL_ID || '-1004461514415';
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'CinePrimeSeries';

function cleanFileName(raw, msgId) {
  let name = (raw || '')
    .replace(/\.(mkv|mp4|avi|webm|mov)$/i, '')
    .replace(/_/g, ' ');

  // Remove channel handles and trailing hyphens/decorations
  name = name.replace(/[-_ ]*@\w+.*$/g, '');
  name = name.replace(/[-+]+$/g, '').trim();

  // Remove year in brackets/parens: (2026) or [2026]
  name = name.replace(/[\(\[]\s*20[12]\d\s*[\)\]]/g, ' ');
  name = name.replace(/\./g, ' ');

  if (!name || name.toLowerCase().startsWith('series episode') || name.toLowerCase().trim() === 'series') {
    return `Heart Beat S03 Episode (File #${msgId}).mkv`;
  }

  // Format combined batches: EP(45 48) -> EP (45-48)
  name = name.replace(/EP\s*\(\s*(\d+)\s*[- ]\s*(\d+)\s*\)/gi, 'EP ($1-$2)');
  name = name.replace(/COMBINED/gi, 'Combined');
  name = name.replace(/WEBR/gi, 'WEBRip');
  name = name.replace(/\s+/g, ' ').trim();
  name = name.replace(/[-_ ]+$/g, '');

  return `${name}.mkv`;
}

function parseQuality(name) {
  if (/2160p|4k/i.test(name)) return '4K';
  if (/1080p|1080/i.test(name)) return '1080P';
  if (/720p|720/i.test(name)) return '720P';
  if (/480p|480/i.test(name)) return '480P';
  return '1080P';
}

function parseCodec(name) {
  if (/hevc|x265|h\.?265/i.test(name)) return 'HEVC';
  if (/x264|h\.?264/i.test(name)) return 'x264';
  if (/avc/i.test(name)) return 'AVC';
  return 'AVC';
}

async function consolidate() {
  console.log('🔄 Consolidating catalog entries for Heart Beat Season 3...');

  if (!fs.existsSync(CATALOG_PATH)) {
    console.error('❌ catalog.json not found!');
    return;
  }

  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  console.log(`📊 Found ${catalog.length} raw series entries in catalog.json.`);

  // 1. Gather all unique files
  const fileMap = new Map();

  for (const s of catalog) {
    for (const f of (s.files || [])) {
      if (!f || !f.channelMessageId) continue;
      // Skip non-media messages (like emojis or text '👇')
      if (f.fileName === '👇' || f.fileName === '🎬 Heart Beat') continue;

      const msgId = f.channelMessageId;
      if (!fileMap.has(msgId)) {
        const cleanName = cleanFileName(f.fileName, msgId);
        const quality = f.quality && f.quality !== '1080P' ? f.quality : parseQuality(f.fileName);
        const codec = f.codec || parseCodec(f.fileName);
        const botDeepLink = `https://t.me/${BOT_USERNAME}?start=get_${msgId}`;

        fileMap.set(msgId, {
          id: `tg-${msgId}`,
          seriesId: 'series-heart-beat',
          seriesSlug: 'heart-beat',
          seriesTitle: 'Heart Beat',
          fileName: cleanName,
          quality,
          codec,
          languages: ['Tamil', 'Multi-Audio'],
          sizeFormatted: f.sizeFormatted || '1.2 GB',
          year: '2026',
          rating: 8.5,
          posterUrl: 'https://static.tvmaze.com/uploads/images/original_untouched/549/1374918.jpg',
          backdropUrl: 'https://static.tvmaze.com/uploads/images/original_untouched/549/1374917.jpg',
          overview: 'RK Multispeciality Hospital is a beacon of hope and healing. Its passionate resident doctors and consultants navigate intense emergency cases, complex patient relationships, and emotional personal trials inside RK Hospital.',
          telegramUrl: botDeepLink,
          channelMessageId: msgId,
          dbChannelId: DB_CHANNEL_ID,
        });
      }
    }
  }

  // Sort files by channelMessageId descending (newest episodes first)
  const consolidatedFiles = Array.from(fileMap.values()).sort((a, b) => b.channelMessageId - a.channelMessageId);
  console.log(`✅ Extracted & Deduplicated ${consolidatedFiles.length} valid episode files.`);

  // 2. Build canonical Heart Beat Season 3 series object
  const heartBeatSeries = {
    id: 'series-heart-beat',
    slug: 'heart-beat',
    title: 'Heart Beat',
    originalTitle: 'Heart Beat',
    overview: 'RK Multispeciality Hospital is a beacon of hope and healing. Its doctors are resilient even when they have to deal with medical and personal challenges. Season 3 follows the passionate resident doctors and senior consultants navigating intense emergency cases, complex patient relationships, and emotional personal trials inside RK Hospital.',
    originalLanguage: 'Tamil',
    originCountry: ['India'],
    genres: ['Drama', 'Medical', 'Romance'],
    firstAirDate: '2024-03-08',
    status: 'Returning Series',
    numberOfSeasons: 3,
    currentSeasonNumber: 3,
    seasonStatusText: 'Season 3 (Current Season)',
    numberOfEpisodes: consolidatedFiles.length,
    rating: 8.5,
    voteCount: 3500,
    ratingSource: 'IMDb',
    posterUrl: 'https://static.tvmaze.com/uploads/images/original_untouched/549/1374918.jpg',
    backdropUrl: 'https://static.tvmaze.com/uploads/images/original_untouched/549/1374917.jpg',
    tmdbId: 81804,
    tvmazeId: 81804,
    trailerVideoId: 'BXA6fsKUXFE',
    creators: ['Deepak Sundarrajan'],
    productionCompanies: ['Disney+ Hotstar Originals'],
    tamilAudioStatus: 'Confirmed',
    tamilSubtitleStatus: 'Confirmed',
    downloadUrl: `https://t.me/${BOT_USERNAME}`,
    telegramUrl: 'https://t.me/cineprimeseries',
    cast: [
      { id: 1, name: 'Deepa Balu', character: 'Dr. Reena', profileUrl: null },
      { id: 2, name: 'Anumol', character: 'Dr. Radhi', profileUrl: null },
      { id: 3, name: 'Charukesh', character: 'Dr. Teja', profileUrl: null },
      { id: 4, name: 'Yogalakshmi', character: 'Dr. Anitha', profileUrl: null },
      { id: 5, name: 'Guru Lakshman', character: 'Dr. Rocky', profileUrl: null },
    ],
    files: consolidatedFiles,
    seasons: [
      {
        seasonNumber: 3,
        title: 'Season 3',
        episodeCount: consolidatedFiles.length,
        posterUrl: 'https://static.tvmaze.com/uploads/images/original_untouched/549/1374918.jpg',
      },
    ],
  };

  // 3. Save single series into catalog.json
  const newCatalog = [heartBeatSeries];
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(newCatalog, null, 2), 'utf8');
  console.log(`💾 Saved 1 canonical series ("Heart Beat") with ${consolidatedFiles.length} files to data/catalog.json!`);

  // 4. Update MongoDB Atlas if connected
  if (MONGODB_URI) {
    try {
      console.log('🔌 Connecting to MongoDB Atlas to update series & files collections...');
      const client = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 8000,
      });
      await client.connect();
      const db = client.db(MONGODB_DATABASE);

      const seriesCol = db.collection('series');
      const filesCol = db.collection('files');

      // Clear existing fragmented series
      await seriesCol.deleteMany({});
      await seriesCol.insertOne(heartBeatSeries);

      // Clear and re-populate files
      await filesCol.deleteMany({});
      if (consolidatedFiles.length > 0) {
        await filesCol.insertMany(consolidatedFiles);
      }

      console.log(`🎉 [MongoDB Atlas Updated] Successfully stored 1 canonical series and ${consolidatedFiles.length} files in MongoDB!`);
      await client.close();
    } catch (dbErr) {
      console.warn('⚠️ MongoDB Atlas update note:', dbErr.message);
    }
  }

  console.log('\n✨ CONSOLIDATION COMPLETE! Live slideshow will now show exactly 1 slide for Heart Beat Season 3!');
}

consolidate();
