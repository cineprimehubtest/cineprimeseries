import fs from 'fs';
import path from 'path';

async function downloadMore() {
  const vids = ['D5RL8fK-Wyo', 'EfqbwOPnWEo', 'dTGbfQVEPfY'];
  for (const id of vids) {
    try {
      const res = await fetch(`https://img.youtube.com/vi/${id}/maxresdefault.jpg`);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        fs.writeFileSync(path.join('public', 'posters', `${id}.jpg`), Buffer.from(buf));
        console.log(`Saved public/posters/${id}.jpg, size:`, buf.byteLength);
      }
    } catch (e) {
      console.error(e.message);
    }
  }
}
downloadMore();
