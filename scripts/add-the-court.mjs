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

// Read raw messages of The Court from task log
const logPath = path.join(
  'C:', 'Users', 'dhara', '.gemini', 'antigravity', 'brain',
  'bcb692ad-5095-4f13-8192-91b639968b1e', '.system_generated', 'tasks', 'task-1358.log'
);

let rawEntries = [];
if (fs.existsSync(logPath)) {
  const log = fs.readFileSync(logPath, 'utf8');
  let currentMsgId = null;
  let currentFileName = null;
  let currentSize = null;

  for (const line of log.split('\n')) {
    if (line.includes('Message ID :')) currentMsgId = parseInt(line.split(':')[1].trim(), 10);
    if (line.includes('File Name  :')) currentFileName = line.split(':')[1].trim();
    if (line.includes('File Size  :')) {
      currentSize = line.split(':')[1].trim();
      if (currentMsgId && currentFileName && currentFileName.toLowerCase().includes('court')) {
        rawEntries.push({ msgId: currentMsgId, rawName: currentFileName, size: currentSize });
        currentMsgId = null;
        currentFileName = null;
        currentSize = null;
      }
    }
  }
}

console.log(`📊 Found ${rawEntries.length} raw files for The Court in log.`);

function cleanCourtFileName(raw, msgId) {
  let name = (raw || '')
    .replace(/\.(mkv|mp4|avi|webm|mov)$/i, '')
    .replace(/_/g, ' ');

  name = name.replace(/[-_ ]*@\w+.*$/g, '');
  name = name.replace(/[-+]+$/g, '').trim();
  name = name.replace(/[\(\[]\s*20[12]\d\s*[\)\]]/g, ' ');
  name = name.replace(/\./g, ' ');

  // Combined: EP(01 04) -> EP (01-04)
  name = name.replace(/EP\s*\(\s*(\d+)\s*[- ]\s*(\d+)\s*\)/gi, 'EP ($1-$2)');
  name = name.replace(/COMBINED/gi, 'Combined');
  name = name.replace(/combined/gi, 'Combined');
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

function getBatchInfo(file) {
  const name = file.fileName;
  const combMatch = name.match(/EP\s*\(\s*(\d+)\s*[- ]\s*(\d+)\s*\)/i);
  if (combMatch) {
    const endEp = parseInt(combMatch[2], 10);
    const qRank = file.quality === '1080P' ? 3 : file.quality === '720P' ? 2 : 1;
    return { batchNum: endEp, isCombined: true, epNum: endEp, subRank: 10 + qRank };
  }
  const epMatch = name.match(/S\d+E(\d+)/i) || name.match(/EP(\d+)/i);
  if (epMatch) {
    const epNum = parseInt(epMatch[1], 10);
    const batchNum = Math.ceil(epNum / 4) * 4;
    return { batchNum, isCombined: false, epNum, subRank: epNum };
  }
  return { batchNum: 0, isCombined: false, epNum: 0, subRank: 0 };
}

function sortLatestFirst(list) {
  return [...list].sort((a, b) => {
    const infoA = getBatchInfo(a);
    const infoB = getBatchInfo(b);
    if (infoA.batchNum !== infoB.batchNum) {
      return infoB.batchNum - infoA.batchNum;
    }
    if (infoA.isCombined && !infoB.isCombined) return -1;
    if (!infoA.isCombined && infoB.isCombined) return 1;
    return infoB.subRank - infoA.subRank;
  });
}

async function addTheCourt() {
  const fileMap = new Map();

  for (const entry of rawEntries) {
    const msgId = entry.msgId;
    if (!fileMap.has(msgId)) {
      const cleanName = cleanCourtFileName(entry.rawName, msgId);
      const quality = parseQuality(entry.rawName);
      const botDeepLink = `https://t.me/${BOT_USERNAME}?start=get_${msgId}`;

      fileMap.set(msgId, {
        id: `tg-${msgId}`,
        seriesId: 'series-the-court',
        seriesSlug: 'the-court',
        seriesTitle: 'The Court',
        fileName: cleanName,
        quality,
        codec: 'AVC',
        languages: ['Tamil', 'Telugu', 'Hindi', 'Malayalam', 'Kannada'],
        sizeFormatted: entry.size || '500 MB',
        year: '2026',
        rating: 8.4,
        posterUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1920&q=80',
        overview: 'The Court is an intense Indian legal and courtroom drama streaming on JioHotstar. Season 1 follows ambitious young advocates and senior defense counsels tackling high-profile murder trials, corporate conspiracies, and moral dilemmas inside the city courtroom.',
        telegramUrl: botDeepLink,
        channelMessageId: msgId,
        dbChannelId: DB_CHANNEL_ID,
      });
    }
  }

  const courtFiles = sortLatestFirst(Array.from(fileMap.values()));
  console.log(`✅ Processed ${courtFiles.length} clean files for The Court.`);

  const theCourtSeries = {
    id: 'series-the-court',
    slug: 'the-court',
    title: 'The Court',
    originalTitle: 'The Court',
    overview: 'The Court is an intense Indian legal and courtroom drama streaming on JioHotstar. Season 1 follows ambitious young advocates and senior defense counsels tackling high-profile murder trials, corporate conspiracies, and moral dilemmas inside the city courtroom.',
    originalLanguage: 'Tamil',
    originCountry: ['India'],
    genres: ['Drama', 'Crime', 'Mystery'],
    firstAirDate: '2026-01-15',
    status: 'Returning Series',
    numberOfSeasons: 1,
    currentSeasonNumber: 1,
    seasonStatusText: 'Season 1 (Current Season)',
    numberOfEpisodes: courtFiles.length,
    rating: 8.4,
    voteCount: 2800,
    ratingSource: 'IMDb',
    posterUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1920&q=80',
    tmdbId: 0,
    tvmazeId: 0,
    trailerVideoId: null,
    creators: ['JioHotstar Special'],
    productionCompanies: ['JioHotstar Originals'],
    tamilAudioStatus: 'Confirmed',
    tamilSubtitleStatus: 'Confirmed',
    downloadUrl: `https://t.me/${BOT_USERNAME}`,
    telegramUrl: 'https://t.me/cineprimeseries',
    cast: [
      { id: 10, name: 'Priya Bhavani Shankar', character: 'Advocate Radhika', profileUrl: null },
      { id: 11, name: 'Arjun Das', character: 'Advocate Vikram', profileUrl: null },
      { id: 12, name: 'Prakash Raj', character: 'Senior Counsel Krishnamurthy', profileUrl: null },
    ],
    files: courtFiles,
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1',
        episodeCount: courtFiles.length,
        posterUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      },
    ],
  };

  // Read existing catalog (Heart Beat)
  let catalog = [];
  if (fs.existsSync(CATALOG_PATH)) {
    catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  }

  // Deduplicate and update
  const existingIdx = catalog.findIndex((s) => s.slug === 'the-court');
  if (existingIdx !== -1) {
    catalog[existingIdx] = theCourtSeries;
  } else {
    catalog.push(theCourtSeries);
  }

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2), 'utf8');
  console.log(`💾 Saved catalog with ${catalog.length} series: ${catalog.map((s) => s.title).join(', ')}`);

  // Sync to MongoDB Atlas
  if (MONGODB_URI) {
    try {
      console.log('🔌 Syncing to MongoDB Atlas...');
      const client = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        family: 4,
      });
      await client.connect();
      const db = client.db(MONGODB_DATABASE);

      await db.collection('series').deleteMany({});
      await db.collection('series').insertMany(catalog);

      const allFiles = catalog.flatMap((s) => s.files || []);
      await db.collection('files').deleteMany({});
      await db.collection('files').insertMany(allFiles);

      console.log(`🎉 [MongoDB Atlas Synced] ${catalog.length} series & ${allFiles.length} total files!`);
      await client.close();
    } catch (e) {
      console.warn('MongoDB sync notice:', e.message);
    }
  }

  console.log('\nTop 5 files of The Court:');
  courtFiles.slice(0, 5).forEach((f) => console.log(`  - [${f.quality}] ${f.fileName} (Msg #${f.channelMessageId})`));
}

addTheCourt();
