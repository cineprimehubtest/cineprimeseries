import fs from 'fs';
import path from 'path';

async function download() {
  const dir = path.join(process.cwd(), 'public', 'posters');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const res = await fetch('https://i.ytimg.com/vi/BXA6fsKUXFE/maxresdefault.jpg');
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(path.join(dir, 'heart-beat-s3-official.jpg'), Buffer.from(buffer));
  console.log('Saved public/posters/heart-beat-s3-official.jpg, size:', buffer.byteLength);
}

download();
