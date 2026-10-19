async function searchTMDB(query) {
  try {
    const res = await fetch(`https://wsrv.nl/?url=https://api.themoviedb.org/3/search/person?query=${encodeURIComponent(query)}&api_key=74683f7b34f7b689d84fcd8e0016d82a`);
    const data = await res.json();
    console.log(`=== ${query} ===`);
    console.log(data.results?.slice(0, 2).map(r => ({ name: r.name, profile_path: r.profile_path })));
  } catch(e) {
    console.error(query, e.message);
  }
}

async function run() {
  await searchTMDB('Jayaprakash');
  await searchTMDB('Vivek Prasanna');
  await searchTMDB('Kim Young-kwang');
  await searchTMDB('Chae Soo-bin');
  await searchTMDB('Lee Jun-hyuk');
  await searchTMDB('Seo Hyun-woo');
  await searchTMDB('Mike Tyson');
  await searchTMDB('Friederike Becht');
}

run();
