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

const client = new MongoClient(uri, { family: 4 });
await client.connect();
const db = client.db('CinePrimeSeries');

const seriesList = await db.collection('series').find({}).toArray();
console.log('--- ALL SERIES IN MONGODB ---');
for (const s of seriesList) {
  console.log(`Slug: ${s.slug} | Title: "${s.title}" | Files count: ${(s.files || []).length}`);
}

const allFiles = await db.collection('files').find({}).toArray();
console.log(`\nTotal files in collection: ${allFiles.length}`);

const lokiFiles = allFiles.filter(f => 
  /loki/i.test(f.fileName) || 
  /loki/i.test(f.caption || '') || 
  f.seriesSlug.includes('loki')
);
console.log(`\nTotal Loki files: ${lokiFiles.length}`);
console.log('Sample Loki files:');
lokiFiles.slice(0, 10).forEach(f => {
  console.log(`Msg #${f.channelMessageId} | ${f.fileName} | ${f.sizeFormatted} | ${f.quality}`);
});

await client.close();
