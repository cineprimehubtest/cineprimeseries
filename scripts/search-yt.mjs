async function searchYT() {
  try {
    const q = encodeURIComponent('Hotstar Specials Heart Beat Season 3 promo');
    const res = await fetch(`https://www.youtube.com/results?search_query=${q}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await res.text();
    const matches = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/g) || [];
    const ids = Array.from(new Set(matches.map(m => m.split('"')[3])));
    console.log('Video IDs:');
    for (const id of ids.slice(0, 8)) {
      const info = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`).then(r => r.json());
      console.log(`- ${id}: ${info.title}`);
    }
  } catch (err) {
    console.error(err);
  }
}
searchYT();
