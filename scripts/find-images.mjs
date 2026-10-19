import fs from 'fs';

const html = fs.readFileSync('scripts/hotstar-page.html', 'utf8');
const regex = /\/sources\/r1\/cms\/prod\/[^"'\s]+/g;
const matches = html.match(regex) || [];

console.log('CMS matches count:', matches.length);
const urls = Array.from(new Set(matches)).map(m => `https://img10.hotstar.com/image/upload/f_auto,q_90,w_800${m}`);
urls.slice(0, 20).forEach(u => console.log(u));
