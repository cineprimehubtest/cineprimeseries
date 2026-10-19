import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import { MongoClient } from 'mongodb';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const catalogPath = path.join(projectRoot, 'data', 'catalog.json');

// Read .env.local
const envPath = path.join(projectRoot, '.env.local');
let MONGODB_URI = '';
let MONGODB_DB_NAME = 'CinePrimeSeries';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.startsWith('MONGODB_URI=')) {
      MONGODB_URI = trimmed.replace('MONGODB_URI=', '').trim();
    }
  }
}

function cleanQualityAndName(file) {
  const caption = file.caption || '';
  const firstLines = caption.split('\n').slice(0, 3).join(' ');
  const cleanFirstLines = firstLines
    .replace(/@\w+/gi, '')
    .replace(/tentkotta_4k/gi, '')
    .replace(/4k_videosongs/gi, '');

  let quality = file.quality;

  // Detect true quality from title line
  if (/2160p|uhd/i.test(cleanFirstLines) || (/\b4k\b/i.test(cleanFirstLines) && !/tentkotta/i.test(firstLines))) {
    quality = '4K';
  } else if (/1080p|1080\b|fhd/i.test(cleanFirstLines)) {
    quality = '1080P';
  } else if (/720p|720\b/i.test(cleanFirstLines)) {
    quality = '720P';
  } else if (/480p|480\b/i.test(cleanFirstLines)) {
    quality = '480P';
  }

  // Fallback check based on file size if quality seems suspiciously 4K for tiny file
  const sizeStr = (file.sizeFormatted || '').toUpperCase();
  if (quality === '4K') {
    if (sizeStr.includes('MB')) {
      const mb = parseFloat(sizeStr);
      if (mb < 300) quality = '480P';
      else if (mb < 600) quality = '720P';
      else quality = '1080P';
    }
  }

  // Parse season and episode from fileName or caption
  const text = file.fileName + ' ' + cleanFirstLines;
  const sMatch = text.match(/S0?(\d+)/i);
  const eMatch = text.match(/E(?:P)?0?(\d+)/i);
  const seasonNum = sMatch ? parseInt(sMatch[1], 10) : 1;
  const epNum = eMatch ? parseInt(eMatch[1], 10) : null;

  // Clean episode title if present
  let epTitle = '';
  if (text.includes('Journey Into Mystery')) epTitle = 'Journey Into Mystery';
  else if (text.includes('The Nexus Event')) epTitle = 'The Nexus Event';
  else if (text.includes('Lamentis')) epTitle = 'Lamentis';
  else if (text.includes('The Variant')) epTitle = 'The Variant';
  else if (text.includes('Glorious Purpose')) epTitle = 'Glorious Purpose';
  else if (text.includes('Ouroboros')) epTitle = 'Ouroboros';
  else if (text.includes('Breaking Brad')) epTitle = 'Breaking Brad';
  else if (text.includes('1893')) epTitle = '1893';
  else if (text.includes('Heart of the TVA')) epTitle = 'Heart of the TVA';
  else if (text.includes('Science Fiction') || text.includes('Science/Fiction')) epTitle = 'Science Fiction';

  const sStr = seasonNum < 10 ? `S0${seasonNum}` : `S${seasonNum}`;
  let newName = '';
  if (epNum) {
    const eStr = epNum < 10 ? `E0${epNum}` : `E${epNum}`;
    newName = epTitle 
      ? `Loki ${sStr}${eStr} ${epTitle} [${quality}].mkv`
      : `Loki ${sStr}${eStr} [${quality}].mkv`;
  } else {
    newName = `Loki ${sStr} [${quality}].mkv`;
  }

  return {
    ...file,
    fileName: newName,
    quality
  };
}

async function main() {
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const loki = catalog.find(s => s.id === 'series-loki' || s.slug === 'loki');
  if (!loki) return;

  console.log(`Original Loki files count: ${loki.files.length}`);

  // 1. Correct quality and standard fileName for each file
  const cleanedFiles = loki.files.map(cleanQualityAndName);

  // 2. Deduplicate files
  // Key: season + episode + quality + rounded size or download link
  const seenMap = new Map();
  for (const f of cleanedFiles) {
    // Generate a unique semantic key for this release
    // If two files are the same episode, same quality, and within 5% file size -> duplicate
    const epMatch = f.fileName.match(/S(\d+)E(\d+)/i);
    const key = epMatch 
      ? `${epMatch[1]}-${epMatch[2]}-${f.quality}-${f.sizeFormatted}`
      : `${f.fileName}-${f.sizeFormatted}`;

    if (!seenMap.has(key)) {
      seenMap.set(key, f);
    } else {
      // If already seen, keep the higher channelMessageId (latest upload)
      const existing = seenMap.get(key);
      if (f.channelMessageId > existing.channelMessageId) {
        seenMap.set(key, f);
      }
    }
  }

  const deduplicatedFiles = Array.from(seenMap.values());
  console.log(`Deduplicated Loki files count: ${deduplicatedFiles.length}`);

  // Check quality counts
  const qCounts = {};
  deduplicatedFiles.forEach(f => qCounts[f.quality] = (qCounts[f.quality] || 0) + 1);
  console.log('Quality breakdown after cleaning:', qCounts);

  // Season breakdown
  const s1Files = deduplicatedFiles.filter(f => /S0?1/i.test(f.fileName));
  const s2Files = deduplicatedFiles.filter(f => /S0?2/i.test(f.fileName));
  console.log(`Season 1 unique files: ${s1Files.length}`);
  console.log(`Season 2 unique files: ${s2Files.length}`);

  loki.files = deduplicatedFiles;
  loki.numberOfEpisodes = 12;
  loki.numberOfSeasons = 2;
  loki.seasons = [
    {
      id: 'loki-season-2',
      seriesId: loki.id,
      seasonNumber: 2,
      title: 'Season 2',
      airDate: '2023-10-05',
      posterUrl: '/posters/loki.jpg',
      episodeCount: 6,
      episodes: loki.episodes?.filter(e => e.seasonNumber === 2) || []
    },
    {
      id: 'loki-season-1',
      seriesId: loki.id,
      seasonNumber: 1,
      title: 'Season 1',
      airDate: '2021-06-09',
      posterUrl: '/posters/loki.jpg',
      episodeCount: 6,
      episodes: loki.episodes?.filter(e => e.seasonNumber === 1) || []
    }
  ];

  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
  console.log('✅ Updated data/catalog.json');

  // Sync to MongoDB Atlas
  try {
    const client = new MongoClient(MONGODB_URI, { family: 4 });
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);

    // Overwrite loki in series collection
    await db.collection('series').updateOne(
      { slug: 'loki' },
      { 
        $set: {
          files: deduplicatedFiles,
          numberOfEpisodes: 12,
          numberOfSeasons: 2,
          seasons: loki.seasons,
          seasonStatusText: "Seasons 1-2 (Complete)",
          updatedAt: new Date()
        }
      }
    );

    // Sync files collection
    const currentTgIds = deduplicatedFiles.map(f => f.id);
    // Delete files belonging to loki that were deduplicated out
    const delRes = await db.collection('files').deleteMany({
      seriesSlug: 'loki',
      id: { $nin: currentTgIds }
    });
    console.log(`🗑️ Removed ${delRes.deletedCount} duplicate files from MongoDB files collection.`);

    // Upsert the remaining clean files
    for (const f of deduplicatedFiles) {
      await db.collection('files').updateOne(
        { id: f.id },
        { $set: f },
        { upsert: true }
      );
    }

    console.log('✅ MongoDB Atlas cleaned and synced successfully!');
    await client.close();
  } catch (err) {
    console.error('MongoDB sync error:', err.message);
  }
}

main();
