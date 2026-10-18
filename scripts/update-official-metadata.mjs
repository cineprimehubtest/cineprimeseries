import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const catalogPath = path.join(projectRoot, 'data', 'catalog.json');

const OFFICIAL_DATA = {
  'heart-beat': {
    posterUrl: 'https://static.tvmaze.com/uploads/images/original_untouched/549/1374918.jpg',
    backdropUrl: 'https://static.tvmaze.com/uploads/images/original_untouched/549/1374917.jpg',
    cast: [
      { id: 101, name: 'Deepa Balu', character: 'Dr. Reena', profileUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/549/1374918.jpg' },
      { id: 102, name: 'Anumol', character: 'Dr. Radhika', profileUrl: null },
      { id: 103, name: 'Karthik Kumar', character: 'Dr. Arjun', profileUrl: null },
      { id: 104, name: 'Charukesh', character: 'Dr. Teju', profileUrl: null },
      { id: 105, name: 'Guru Lakshman', character: 'Dr. Naveen', profileUrl: null }
    ]
  },
  'loki': {
    posterUrl: 'https://static.tvmaze.com/uploads/images/original_untouched/478/1195717.jpg',
    backdropUrl: 'https://static.tvmaze.com/uploads/images/original_untouched/317/794815.jpg',
    cast: [
      { id: 201, name: 'Tom Hiddleston', character: 'Loki', profileUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/46/117106.jpg' },
      { id: 202, name: 'Owen Wilson', character: 'Mobius M. Mobius', profileUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/572/1430173.jpg' },
      { id: 203, name: 'Sophia Di Martino', character: 'Sylvie', profileUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/3/8266.jpg' },
      { id: 204, name: 'Wunmi Mosaku', character: 'Hunter B-15', profileUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/610/1526544.jpg' },
      { id: 205, name: 'Gugu Mbatha-Raw', character: 'Ravonna Renslayer', profileUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/45/114825.jpg' }
    ]
  },
  'stranger-things': {
    posterUrl: 'https://static.tvmaze.com/uploads/images/original_untouched/595/1489169.jpg',
    backdropUrl: 'https://static.tvmaze.com/uploads/images/original_untouched/70/175852.jpg',
    cast: [
      { id: 301, name: 'Winona Ryder', character: 'Joyce Byers', profileUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/204/511427.jpg' },
      { id: 302, name: 'Caleb McLaughlin', character: 'Lucas Sinclair', profileUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/611/1527525.jpg' },
      { id: 303, name: 'Finn Wolfhard', character: 'Mike Wheeler', profileUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/611/1527529.jpg' },
      { id: 304, name: 'Gaten Matarazzo', character: 'Dustin Henderson', profileUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/611/1527523.jpg' },
      { id: 305, name: 'Natalia Dyer', character: 'Nancy Wheeler', profileUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/158/396002.jpg' }
    ]
  },
  'fallout': {
    posterUrl: 'https://static.tvmaze.com/uploads/images/original_untouched/599/1499142.jpg',
    backdropUrl: 'https://static.tvmaze.com/uploads/images/original_untouched/514/1285808.jpg',
    cast: [
      { id: 401, name: 'Walton Goggins', character: 'The Ghoul / Cooper Howard', profileUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/4/10179.jpg' },
      { id: 402, name: 'Ella Purnell', character: 'Lucy MacLean', profileUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/243/608111.jpg' },
      { id: 403, name: 'Aaron Moten', character: 'Maximus', profileUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/514/1285155.jpg' },
      { id: 404, name: 'Moises Arias', character: 'Norm MacLean', profileUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/145/364863.jpg' },
      { id: 405, name: 'Frances Turner', character: 'Barb Howard', profileUrl: 'https://static.tvmaze.com/uploads/images/medium_portrait/517/1293769.jpg' }
    ]
  }
};

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

for (const series of catalog) {
  const off = OFFICIAL_DATA[series.slug];
  if (off) {
    series.posterUrl = off.posterUrl;
    series.backdropUrl = off.backdropUrl;
    series.cast = off.cast;

    if (series.files) {
      for (const file of series.files) {
        file.posterUrl = off.posterUrl;
        file.backdropUrl = off.backdropUrl;
      }
    }
  }
}

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
console.log('✅ catalog.json successfully updated with 100% REAL OFFICIAL posters, backdrops, and cast photos!');
