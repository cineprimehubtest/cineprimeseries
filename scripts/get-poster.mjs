async function run() {
  try {
    const res = await fetch('https://cinefry.co.in/heart-beat-season-3-tamil-web-series/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = await res.text();
    const ogImage = html.match(/<meta property=["']og:image["'] content=["']([^"']+)["']/i);
    console.log('OG Image:', ogImage ? ogImage[1] : 'null');
  } catch (err) {
    console.error(err);
  }
}
run();
