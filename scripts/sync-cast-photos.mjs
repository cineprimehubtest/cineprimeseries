import dns from 'dns';
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const CATALOG_PATH = path.join(projectRoot, 'data', 'catalog.json');
const cat = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));

const castMap = {
  'deepa balu': '/cast/deepa-balu.jpg',
  'anumol': '/cast/anumol.jpg',
  'charukesh': '/cast/charukesh.jpg',
  'karthik kumar': '/cast/karthik-kumar.jpg',
  'guru lakshman': '/cast/guru-lakshman.jpg',
  'yogalakshmi': '/cast/yogalakshmi.jpg',
  'lee jun-hyuk': '/cast/lee-jun-hyuk.jpg',
  'mike tyson': '/cast/mike-tyson.jpg',
  'friederike becht': '/cast/friederike-becht.jpg',
  'hans löw': '/cast/hans-low.jpg',
  'hans low': '/cast/hans-low.jpg',
  'matthias brandt': '/cast/matthias-brandt.jpg',
  'tom hiddleston': '/cast/tom-hiddleston.jpg',
  'owen wilson': '/cast/owen-wilson.jpg',
  'sophia di martino': '/cast/sophia-di-martino.jpg',
  'wunmi mosaku': '/cast/wunmi-mosaku.jpg',
  'tara strong': '/cast/tara-strong.jpg'
};

cat.forEach(s => {
  (s.cast || []).forEach(c => {
    const k = c.name.toLowerCase().trim();
    if (castMap[k]) {
      c.profileUrl = castMap[k];
    }
  });
});

fs.writeFileSync(CATALOG_PATH, JSON.stringify(cat, null, 2), 'utf8');
console.log('✅ Updated data/catalog.json with local cast images!');

const envPath = path.join(projectRoot, '.env.local');
const env = fs.readFileSync(envPath, 'utf8');
const uri = env.match(/MONGODB_URI=(.+)/)[1].trim();

const client = new MongoClient(uri, { family: 4 });
await client.connect();
const db = client.db('CinePrimeSeries');

for (const s of cat) {
  await db.collection('series').updateOne(
    { slug: s.slug },
    { $set: { cast: s.cast, posterUrl: s.posterUrl, backdropUrl: s.backdropUrl, trailerVideoId: s.trailerVideoId } }
  );
}
console.log('✅ Updated MongoDB Atlas series with local cast images!');
await client.close();
