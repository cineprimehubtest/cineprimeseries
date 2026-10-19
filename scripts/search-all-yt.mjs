async function searchYT(query) {
  try {
    const res = await fetch('https://www.youtube.com/results?search_query=' + encodeURIComponent(query), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    const regex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
    const matches = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      matches.push(match[1]);
    }
    const unique = [...new Set(matches)].slice(0, 4);
    console.log(query + ' ->', unique);
  } catch(e) {
    console.error(query, e.message);
  }
}

async function run() {
  await searchYT('Hotstar Specials The Court promo trailer');
  await searchYT('Take Charge of My Heart Netflix official trailer');
  await searchYT('The Ordinary Jackpot trailer');
  await searchYT('Tyson 2026 Netflix trailer');
  await searchYT('The Trap 2026 Netflix Die Falle trailer');
}

run();
