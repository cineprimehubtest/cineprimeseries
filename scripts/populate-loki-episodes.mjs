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

async function main() {
  console.log('🔄 Fetching official Loki episode guide from TVmaze...');
  const res = await fetch('https://api.tvmaze.com/shows/41007/episodes');
  const tvmazeEps = await res.json();

  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const loki = catalog.find(s => s.id === 'series-loki' || s.slug === 'loki');
  if (!loki) {
    console.error('Loki not found in catalog.json');
    return;
  }

  const files = loki.files || [];

  // Map TVmaze episodes to our Episode schema
  const episodes = tvmazeEps.map((ep) => {
    // Find matching file in our uploaded releases for this episode
    const seasonNum = ep.season;
    const epNum = ep.number;
    const pattern = new RegExp(`S0?${seasonNum}E0?${epNum}(?![0-9])`, 'i');
    
    // Find highest quality file first (4K > 1080P > 720P)
    const matchingFiles = files.filter(f => pattern.test(f.fileName));
    let bestFile = matchingFiles.find(f => (f.quality || '').includes('4K') || f.fileName.includes('4K'))
      || matchingFiles.find(f => (f.quality || '').includes('1080') || f.fileName.includes('1080'))
      || matchingFiles[0];

    const downloadUrl = bestFile?.downloadUrl || (bestFile?.telegramMessageId ? `https://t.me/CinePrimeSeries_bot?start=get_${bestFile.telegramMessageId}` : null);
    const synopsis = ep.summary ? ep.summary.replace(/<[^>]+>/g, '').trim() : '';

    return {
      id: `loki-s${seasonNum}-e${epNum}`,
      seriesId: loki.id,
      seasonNumber: seasonNum,
      episodeNumber: epNum,
      title: ep.name,
      synopsis,
      airDate: ep.airdate,
      runtime: ep.runtime || 50,
      stillUrl: ep.image?.original || ep.image?.medium || '/posters/loki-backdrop.jpg',
      downloadUrl,
      telegramUrl: downloadUrl || loki.telegramUrl,
      verified: true
    };
  });

  // Update seasons structure
  const seasons = [
    {
      id: 'loki-season-2',
      seriesId: loki.id,
      seasonNumber: 2,
      title: 'Season 2',
      airDate: '2023-10-05',
      posterUrl: '/posters/loki.jpg',
      episodeCount: 6,
      episodes: episodes.filter(e => e.seasonNumber === 2)
    },
    {
      id: 'loki-season-1',
      seriesId: loki.id,
      seasonNumber: 1,
      title: 'Season 1',
      airDate: '2021-06-09',
      posterUrl: '/posters/loki.jpg',
      episodeCount: 6,
      episodes: episodes.filter(e => e.seasonNumber === 1)
    }
  ];

  loki.numberOfSeasons = 2;
  loki.numberOfEpisodes = 12;
  loki.seasons = seasons;
  loki.episodes = episodes;
  loki.seasonStatusText = "Seasons 1-2 (Complete)";
  loki.backdropUrl = "/posters/loki-backdrop.jpg";

  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
  console.log(`✅ Updated local catalog.json with 12 Loki episodes across Season 1 and Season 2!`);

  // Sync to MongoDB Atlas
  try {
    const client = new MongoClient(MONGODB_URI, { family: 4 });
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);
    const seriesCol = db.collection('series');

    await seriesCol.updateOne(
      { slug: 'loki' },
      {
        $set: {
          numberOfSeasons: 2,
          numberOfEpisodes: 12,
          seasons,
          episodes,
          seasonStatusText: "Seasons 1-2 (Complete)",
          backdropUrl: "/posters/loki-backdrop.jpg",
          updatedAt: new Date()
        }
      }
    );
    console.log(`✅ Synced Loki episode guide and metadata to MongoDB Atlas!`);
    await client.close();
  } catch (err) {
    console.error('MongoDB sync error:', err.message);
  }
}

main();
