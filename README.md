# CinePrimeSeries — Premium TV Series Discovery Platform

A production-ready TV-series discovery platform built with Next.js App Router, TypeScript, Tailwind CSS, Lucide icons, MongoDB Atlas, TVmaze API, TMDB TV API, and the official YouTube embedded player.

> **STRICT CONTENT RULE:** CinePrimeSeries is exclusively for TV series and web shows. Feature films and movies are strictly excluded across all endpoints, search results, and category listings.

---

## 1. Features

- **Premium Glassmorphism Design System**: Cinematic midnight navy background (`#060913`), electric violet accents (`#8b5cf6`), soft cyan accents (`#06b6d4`), translucent frosted glass cards with subtle borders and backdrop blur.
- **Strictly TV Series Only**: Uses television-specific APIs (`/trending/tv/week`, `/tv/{id}`, `/shows`) and rejects any movie records.
- **10 Curated Main Categories**:
  1. Action
  2. Adventure
  3. Comedy
  4. Crime
  5. Drama
  6. Fantasy
  7. Horror
  8. Mystery
  9. Romance
  10. Sci-Fi
- **Global TV Search & Autocomplete**: Debounced live suggestions, case-insensitive title search, status filters (Ongoing/Ended), language filters, release year filters, and shareable query URLs (`/search?q=...&genre=...`).
- **Rich Series Detail Pages (`/series/[slug]`)**:
  - High-res backdrops and poster artwork.
  - Full synopsis and credit metadata (creators, showrunners, production companies).
  - Horizontally scrollable Cast Carousel with character names and clickable person details.
  - Season tabs and complete episode guides with still thumbnails, air dates, and runtimes.
  - Per-episode authorized download and Telegram buttons.
- **Official YouTube Trailer Player Modal**: In-site 16:9 embedded player with fallback to direct YouTube search if embedding is restricted.
- **Language & Audio Provenance System**: Displays verified audio tracks, subtitles, and explicit Tamil audio status (`Confirmed`, `Not confirmed`, `Unavailable`, `Not checked`).
- **Protected Admin Control Center (`/admin`)**:
  - Protected with `ADMIN_AUTH_SECRET`.
  - Real-time connectivity health check for MongoDB, TMDB, TVmaze, and Telegram Bot.
  - Single-click import by TMDB TV ID or TVmaze Show ID.
  - Edit synopsis, trailer video IDs, download URLs, and Telegram post links.
- **SEO & Social Sharing**:
  - Dynamic OpenGraph and Twitter cards.
  - Schema.org `TVSeries` structured data (`application/ld+json`).
  - Auto-generated XML Sitemap (`/sitemap.xml`) and robots.txt (`/robots.txt`).

---

## 2. Environment Variables Configuration

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

### Required Configuration

| Variable | Description | Where to Configure |
| :--- | :--- | :--- |
| `TELEGRAM_BOT_TOKEN` | Bot API Token obtained from [@BotFather](https://t.me/BotFather) | `.env.local` / Vercel Env Vars |
| `TMDB_API_KEY` | TMDB API v3 Key for TV trailers, artwork, and cast | `.env.local` / Vercel Env Vars |
| `TVMAZE_API_KEY` | Optional TVmaze API Key (public endpoints operate without one) | `.env.local` / Vercel Env Vars |
| `MONGODB_URI` | MongoDB Atlas cluster connection string (`mongodb+srv://...`) | `.env.local` / Vercel Env Vars |
| `MONGODB_DATABASE` | MongoDB database name (defaults to `CinePrimeSeries`) | `.env.local` / Vercel Env Vars |
| `TELEGRAM_BOT_USERNAME` | Telegram Bot username (e.g. `CinePrimeSeries_bot`) | `.env.local` / Vercel Env Vars |
| `TELEGRAM_CHANNEL_URL` | Official Telegram channel link (e.g. `https://t.me/CinePrimeSeries`) | `.env.local` / Vercel Env Vars |
| `ADMIN_AUTH_SECRET` | Secret passphrase to unlock the `/admin` portal | `.env.local` / Vercel Env Vars |

---

## 3. Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Test Suite
```bash
npm test
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build and Run Production Server
```bash
npm run build
npm run start
```

---

## 4. Vercel Deployment Instructions

1. Push your repository to GitHub / GitLab (ensure `.env.local` is ignored as configured in `.gitignore`).
2. Log in to [Vercel Dashboard](https://vercel.com) and click **"Add New Project"**.
3. Import the repository and select the root directory (or root project folder `cineprimeseries`).
4. In **Project Settings -> Environment Variables**, add the environment variables from your `.env.local`:
   - `TELEGRAM_BOT_TOKEN`
   - `TMDB_API_KEY`
   - `TVMAZE_API_KEY`
   - `MONGODB_URI`
   - `MONGODB_DATABASE`
   - `TELEGRAM_BOT_USERNAME`
   - `TELEGRAM_CHANNEL_URL`
   - `ADMIN_AUTH_SECRET`
5. Click **"Deploy"**. Vercel will build and assign your production domain.

---

## 5. MongoDB Atlas Connection Note

If connecting from local development or Vercel, ensure your MongoDB Atlas cluster has network access enabled:
1. Go to [MongoDB Atlas Console](https://cloud.mongodb.com/).
2. Navigate to **Security -> Network Access**.
3. Click **"Add IP Address"** and select **"Allow Access from Anywhere"** (`0.0.0.0/0`) or whitelist your current developer IP.
4. If IP whitelist restrictions apply, CinePrimeSeries' resilient architecture seamlessly falls back to the high-performance TVmaze catalog and verified seed dataset without interrupting user browsing.

---

## 6. Verification Checklist

- [x] **Local Server Running**: Verified live on `http://localhost:3000` (`HTTP 200`).
- [x] **Strict TV Content**: Rejects all movie records; TV shows and web series only.
- [x] **Search Autocomplete**: Live debounced search querying `/api/search`.
- [x] **10 Main Genres**: Action, Adventure, Comedy, Crime, Drama, Fantasy, Horror, Mystery, Romance, Sci-Fi all functioning.
- [x] **Series Details SSR**: Verified `/series/heart-beat` rendering backdrop, cast carousel, and episode guide.
- [x] **YouTube Trailer Player**: Official YouTube player iframe integration with fallback search link.
- [x] **Telegram Integration**: Telegram bot token verified active (`@CinePrimeSeries_bot`), direct channel and episode links.
- [x] **Protected Admin Portal**: Secured behind `ADMIN_AUTH_SECRET` at `/admin` with service health checks and link editors.
- [x] **SEO Standards**: Dynamic sitemap (`/sitemap.xml`), robots.txt, and Schema.org `TVSeries` structured data.
