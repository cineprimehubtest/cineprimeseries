import dns from 'dns';
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const envPath = path.join(projectRoot, '.env.local');
const env = fs.readFileSync(envPath, 'utf8');
const uri = env.match(/MONGODB_URI=(.+)/)[1].trim();

const CATALOG_PATH = path.join(projectRoot, 'data', 'catalog.json');

const client = new MongoClient(uri, { family: 4 });
await client.connect();
const db = client.db('CinePrimeSeries');

console.log('🔄 Re-indexing Loki and cleaning database...');

// 1. Fetch all files from Mongo that belong to Loki
const allFiles = await db.collection('files').find({}).toArray();
const lokiDbFiles = allFiles.filter(f => 
  /loki/i.test(f.fileName) || 
  /loki/i.test(f.caption || '') || 
  (f.seriesSlug && f.seriesSlug.includes('loki'))
);

console.log(`Found ${lokiDbFiles.length} Loki files to re-index.`);

function parseLokiFile(f) {
  const text = `${f.fileName || ''} ${f.caption || ''}`;
  
  // Extract Season and Episode
  let sNum = 2;
  let eNum = 1;
  let epTitle = '';
  
  const seMatch = text.match(/S0?(\d+)[\.\s_-]*E(?:P)?0?(\d+)(?:[\.\s_-]+([a-zA-Z\s]+))?/i);
  if (seMatch) {
    sNum = parseInt(seMatch[1], 10);
    eNum = parseInt(seMatch[2], 10);
    if (seMatch[3]) {
      const candidate = seMatch[3].trim();
      if (!/^(HQ|HDRip|Tamil|Multi|WEB|DL|x264|x265|HEVC|DDP|AAC|ESub|480p|720p|1080p|2160p)/i.test(candidate)) {
        epTitle = candidate;
      }
    }
  }

  // Quality
  let quality = f.quality || '1080P';
  if (/2160p|4k\b|uhd/i.test(text)) quality = '4K';
  else if (/1080p|1080\b/i.test(text)) quality = '1080P';
  else if (/720p|720\b/i.test(text)) quality = '720P';
  else if (/480p|480\b/i.test(text)) quality = '480P';

  // Codec
  let codec = 'AVC';
  if (/hevc|x265/i.test(text)) codec = 'HEVC';
  else if (/x264/i.test(text)) codec = 'x264';

  const languages = ['Tamil', 'Multi-Audio'];
  if (/hindi/i.test(text)) languages.push('Hindi');
  if (/telugu/i.test(text)) languages.push('Telugu');
  if (/english/i.test(text)) languages.push('English');

  const sPadded = sNum < 10 ? `0${sNum}` : `${sNum}`;
  const ePadded = eNum < 10 ? `0${eNum}` : `${eNum}`;

  let cleanFileName = `Loki S${sPadded}E${ePadded}`;
  if (epTitle && epTitle.length > 2 && epTitle.length < 25) {
    cleanFileName += ` ${epTitle}`;
  }
  cleanFileName += ` [${quality}].mkv`;

  return {
    id: f.id || `tg-${f.channelMessageId}`,
    seriesId: 'series-loki',
    seriesSlug: 'loki',
    seriesTitle: 'Loki',
    fileName: cleanFileName,
    quality,
    codec,
    languages: Array.from(new Set(languages)),
    sizeFormatted: f.sizeFormatted || '1.2 GB',
    year: '2023',
    rating: 8.2,
    posterUrl: '/posters/loki.jpg',
    backdropUrl: '/posters/loki-backdrop.jpg',
    overview: 'The mercurial villain Loki resumes his role as the God of Mischief in a new series that takes place after the events of Avengers: Endgame.',
    telegramUrl: `https://t.me/CinePrimeSeries_bot?start=get_${f.channelMessageId}`,
    channelMessageId: f.channelMessageId,
    dbChannelId: f.dbChannelId || '-1004461514415',
    caption: f.caption || '',
  };
}

const cleanLokiFiles = lokiDbFiles.map(parseLokiFile);

// Sort files: Season 2 first, then Season 1, highest quality first
cleanLokiFiles.sort((a, b) => {
  const getNum = (str) => {
    const m = str.match(/S0?(\d+)E0?(\d+)/i);
    return m ? parseInt(m[1]) * 100 + parseInt(m[2]) : 0;
  };
  const diff = getNum(b.fileName) - getNum(a.fileName);
  if (diff !== 0) return diff;
  const qMap = { '4K': 4, '1080P': 3, '720P': 2, '480P': 1 };
  return (qMap[b.quality] || 0) - (qMap[a.quality] || 0);
});

// Canonical Loki Series Object
const lokiSeries = {
  id: 'series-loki',
  slug: 'loki',
  title: 'Loki',
  originalTitle: 'Loki',
  overview: 'The mercurial villain Loki resumes his role as the God of Mischief in a new series that takes place after the events of Avengers: Endgame. Traveling across timelines with Agent Mobius and the Time Variance Authority, Loki discovers secrets of the multiverse.',
  originalLanguage: 'English',
  originCountry: ['US'],
  genres: ['Action & Adventure', 'Sci-Fi & Fantasy', 'Drama'],
  firstAirDate: '2021-06-09',
  status: 'Ended',
  numberOfSeasons: 2,
  currentSeasonNumber: 2,
  seasonStatusText: 'Season 2 (Completed)',
  numberOfEpisodes: cleanLokiFiles.length,
  rating: 8.2,
  voteCount: 350000,
  ratingSource: 'IMDb',
  posterUrl: '/posters/loki.jpg',
  backdropUrl: '/posters/loki-backdrop.jpg',
  tmdbId: 88396,
  tvmazeId: 41170,
  trailerVideoId: 'nW948Va-l10',
  creators: ['Michael Waldron', 'Marvel Studios'],
  productionCompanies: ['Marvel Studios', 'Disney+'],
  tamilAudioStatus: 'Confirmed',
  tamilSubtitleStatus: 'Confirmed',
  downloadUrl: 'https://t.me/CinePrimeSeries_bot?start=get_692',
  telegramUrl: 'https://t.me/CinePrimeSeries',
  cast: [
    { id: 61, name: 'Tom Hiddleston', character: 'Loki', profileUrl: '/cast/tom-hiddleston.jpg' },
    { id: 62, name: 'Owen Wilson', character: 'Mobius M. Mobius', profileUrl: '/cast/owen-wilson.jpg' },
    { id: 63, name: 'Sophia Di Martino', character: 'Sylvie', profileUrl: '/cast/sophia-di-martino.jpg' },
    { id: 64, name: 'Wunmi Mosaku', character: 'Hunter B-15', profileUrl: '/cast/wunmi-mosaku.jpg' },
    { id: 65, name: 'Tara Strong', character: 'Miss Minutes', profileUrl: '/cast/tara-strong.jpg' },
  ],
  files: cleanLokiFiles,
  seasons: [
    { seasonNumber: 2, title: 'Season 2', episodeCount: cleanLokiFiles.filter(f => f.fileName.includes('S02')).length, posterUrl: '/posters/loki.jpg' },
    { seasonNumber: 1, title: 'Season 1', episodeCount: cleanLokiFiles.filter(f => f.fileName.includes('S01')).length, posterUrl: '/posters/loki.jpg' },
  ],
  updatedAt: new Date().toISOString()
};

// 2. Clean MongoDB Atlas
// Remove old glitch series
await db.collection('series').deleteMany({
  slug: { $in: ['lix-movies-com-loki-ouroboros', 'loki-s01e03-1080p-ds4k-bluray-sdr-x265-hevc-10bit-ddp-5-1', 'loki'] }
});

// Upsert canonical Loki series
await db.collection('series').insertOne(lokiSeries);
console.log(`✅ Upserted canonical Loki series into MongoDB with ${cleanLokiFiles.length} files.`);

// Update files in Mongo
for (const f of cleanLokiFiles) {
  await db.collection('files').updateOne(
    { channelMessageId: f.channelMessageId },
    { $set: f },
    { upsert: true }
  );
}
console.log(`✅ Synced all ${cleanLokiFiles.length} Loki files in MongoDB collection.`);

// 3. Update local catalog.json
let catalog = [];
if (fs.existsSync(CATALOG_PATH)) {
  catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
}

// Remove old glitch slugs
catalog = catalog.filter(s => s.slug !== 'lix-movies-com-loki-ouroboros' && s.slug !== 'loki-s01e03-1080p-ds4k-bluray-sdr-x265-hevc-10bit-ddp-5-1' && s.slug !== 'loki');

// Insert Loki in catalog
catalog.push(lokiSeries);

fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2), 'utf8');
console.log(`✅ Updated local data/catalog.json (Total series: ${catalog.length}).`);

await client.close();
console.log('🎉 Done re-indexing Loki!');
