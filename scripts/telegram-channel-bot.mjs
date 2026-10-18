/**
 * CinePrimeSeries - Telegram Database Channel & File Store Bot
 * 
 * Target Storage Channel: -1004461514415 (https://t.me/cineprimeseries)
 * Bot Username: @CinePrimeSeries_bot
 * 
 * 1. Listens for forwarded files in Database Channel (-1004461514415)
 * 2. Groups all episode files into their CANONICAL series (1 series poster in Hero Slideshow!)
 * 3. Formats clean episode titles (strips @CinePrimeHub, etc.)
 * 4. Saves & indexes to MongoDB Atlas & data/catalog.json
 * 5. Delivers files directly to user's chat via copyMessage on /start get_<id>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import { MongoClient } from 'mongodb';

// Fix DNS for MongoDB SRV lookups on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // Ignore
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// 1. Load environment variables from .env.local
function loadEnv() {
  const envPath = path.join(projectRoot, '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim();
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BOT_USERNAME = (process.env.TELEGRAM_BOT_USERNAME || 'CinePrimeSeries_bot').replace('@', '').trim();
const DB_CHANNEL_ID = process.env.TELEGRAM_DB_CHANNEL_ID || '-1004461514415';
const CATALOG_PATH = path.join(projectRoot, 'data', 'catalog.json');
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'CinePrimeSeries';

if (!BOT_TOKEN) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN is not configured in .env.local!');
  process.exit(1);
}

// Global MongoDB references
let mongoClient = null;
let mongoDb = null;
let isMongoConnected = false;
let lastActiveSeriesSlug = 'heart-beat';

// Initialize MongoDB Atlas connection & create collections/indexes
async function initMongoDB() {
  if (!MONGODB_URI) {
    console.log('ℹ️  MONGODB_URI not configured. Operating in local JSON catalog mode.');
    return null;
  }

  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    mongoClient = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 8000,
      family: 4, // Force IPv4 to prevent Windows SSL handshake failure
    });
    await mongoClient.connect();
    mongoDb = mongoClient.db(MONGODB_DATABASE);
    isMongoConnected = true;
    console.log(`✅ [MongoDB Atlas Connected] Database: "${MONGODB_DATABASE}"`);

    // Ensure collections and indexes exist
    const seriesCol = mongoDb.collection('series');
    const filesCol = mongoDb.collection('files');

    await seriesCol.createIndex({ slug: 1 }, { unique: true });
    await seriesCol.createIndex({ title: 'text', overview: 'text' });
    await seriesCol.createIndex({ rating: -1 });

    await filesCol.createIndex({ id: 1 }, { unique: true });
    await filesCol.createIndex({ channelMessageId: 1 });
    await filesCol.createIndex({ seriesSlug: 1 });

    console.log('📑 [MongoDB Indexes Initialized] series & files collections ready');
    return mongoDb;
  } catch (err) {
    isMongoConnected = false;
    console.warn(`⚠️ [MongoDB Notice] ${err.message}`);
    console.log('📂 Local JSON engine active (data/catalog.json). Bot and website operate with zero interruption.');
    return null;
  }
}

// Format bytes to human readable format
function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '1.2 GB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Clean series title and release metadata from file name
function parseFileInfo(rawFileName, messageId, activeSeries = null) {
  let name = (rawFileName || '')
    .replace(/\.(mkv|mp4|avi|webm|mov)$/i, '')
    .replace(/_/g, ' ');

  // Parse Quality
  let quality = '1080P';
  if (/2160p|4k/i.test(name)) quality = '4K';
  else if (/1080p|1080/i.test(name)) quality = '1080P';
  else if (/720p|720/i.test(name)) quality = '720P';
  else if (/480p|480/i.test(name)) quality = '480P';

  // Parse Codec
  let codec = 'AVC';
  if (/hevc|x265|h\.?265/i.test(name)) codec = 'HEVC';
  else if (/x264|h\.?264/i.test(name)) codec = 'x264';
  else if (/avc/i.test(name)) codec = 'AVC';
  else if (/fenix/i.test(name)) codec = 'FENiX';

  // Parse Languages
  const languages = [];
  if (/tam|tamil/i.test(name)) languages.push('Tamil');
  if (/tel|telugu/i.test(name)) languages.push('Telugu');
  if (/hin|hindi/i.test(name)) languages.push('Hindi');
  if (/mal|malayalam/i.test(name)) languages.push('Malayalam');
  if (/kan|kannada/i.test(name)) languages.push('Kannada');
  if (/eng|english/i.test(name)) languages.push('English');
  if (languages.length === 0) languages.push('Tamil', 'Multi-Audio');

  // Parse Year
  const yearMatch = name.match(/\b(20[12]\d)\b/);
  const year = yearMatch ? yearMatch[1] : '2026';

  // Clean raw tags for title parsing
  let stripped = name
    .replace(/[-_ ]*@\w+.*$/g, '')
    .replace(/[-+]+$/g, '')
    .replace(/[\(\[]\s*20[12]\d\s*[\)\]]/g, ' ')
    .replace(/\./g, ' ')
    .trim();

  // Extract Season and Episode information
  let seasonNumber = 3;
  let episodeNumber = null;
  let episodeTitle = '';
  let candidateTitle = '';
  let isCombined = false;
  let combinedRange = '';

  // Case 1: Combined episode batches: S03 EP(45 48) COMBINED
  const combinedMatch = stripped.match(/^(.*?)(?:[ ._-]+)?\bS(\d{1,2})\s*EP\s*\(\s*(\d+)\s*[- ]\s*(\d+)\s*\)\s*(COMBINED)?(.*)$/i);
  if (combinedMatch) {
    candidateTitle = combinedMatch[1].trim();
    seasonNumber = parseInt(combinedMatch[2], 10);
    combinedRange = `${combinedMatch[3]}-${combinedMatch[4]}`;
    isCombined = true;
  } else {
    // Case 2: Standard episode: S03E48 Growing Suspicion
    const epMatch = stripped.match(/^(.*?)(?:[ ._-]+)?\bS(\d{1,2})\s*E(?:P)?\s*(\d{1,3})\b(?:\s+(.*?))?(?:1080p|720p|480p|4k|2160p|hevc|x265|x264|avc|webrip|web-?dl|hdr|aac|ddp|$)/i);
    if (epMatch) {
      candidateTitle = epMatch[1].trim();
      seasonNumber = parseInt(epMatch[2], 10);
      episodeNumber = parseInt(epMatch[3], 10);
      episodeTitle = (epMatch[4] || '').replace(/[-+.]/g, ' ').trim();
    } else {
      // Case 3: Season marker without episode: S03 or Season 3
      const seasonMatch = stripped.match(/^(.*?)(?:[ ._-]+)?\b(?:S(\d{1,2})|Season\s*(\d{1,2}))\b/i);
      if (seasonMatch) {
        candidateTitle = seasonMatch[1].trim();
        seasonNumber = parseInt(seasonMatch[2] || seasonMatch[3], 10);
      } else {
        candidateTitle = stripped;
      }
    }
  }

  // Clean candidate title
  candidateTitle = candidateTitle
    .replace(/\b(20[12]\d)\b/g, '')
    .replace(/\(\s*\)|\[\s*\]/g, ' ')
    .replace(/[-+.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Normalize specific Indian shows
  if (/heart\s*beat/i.test(name) || /heart\s*beat/i.test(candidateTitle)) {
    candidateTitle = 'Heart Beat';
  }

  // Fallback if uncaptioned or generic Telegram video (e.g. Series_Episode_361)
  const isGeneric = !candidateTitle || candidateTitle.toLowerCase().startsWith('series episode') || candidateTitle.toLowerCase().trim() === 'series' || candidateTitle.length < 2;
  if (isGeneric) {
    candidateTitle = activeSeries ? activeSeries.title : 'Heart Beat';
  }

  // Build clean, beautiful file name
  let cleanFileName = '';
  if (isCombined) {
    cleanFileName = `${candidateTitle} S0${seasonNumber} EP (${combinedRange}) Combined ${quality}.mkv`;
  } else if (episodeNumber && episodeTitle) {
    cleanFileName = `${candidateTitle} S0${seasonNumber}E${episodeNumber < 10 ? '0' + episodeNumber : episodeNumber} ${episodeTitle}.mkv`;
  } else if (episodeNumber) {
    cleanFileName = `${candidateTitle} S0${seasonNumber}E${episodeNumber < 10 ? '0' + episodeNumber : episodeNumber}.mkv`;
  } else if (isGeneric) {
    cleanFileName = `${candidateTitle} S0${seasonNumber} Episode (File #${messageId}).mkv`;
  } else {
    cleanFileName = `${candidateTitle} S0${seasonNumber} ${quality}.mkv`;
  }

  const slug = candidateTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return {
    seriesTitle: candidateTitle,
    slug,
    seasonNumber,
    episodeNumber,
    episodeTitle,
    cleanFileName,
    quality,
    codec,
    languages,
    year,
  };
}

// Fetch official series metadata from TVmaze
async function fetchOfficialMetadata(seriesTitle) {
  try {
    const res = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(seriesTitle)}&embed[]=cast&embed[]=images`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CinePrimeSeries/1.0' },
    });

    if (res.ok) {
      const data = await res.json();
      const bg = (data._embedded?.images || []).find((i) => i.type === 'background');
      const cast = (data._embedded?.cast || []).slice(0, 6).map((c, i) => ({
        id: c.person.id || 100 + i,
        name: c.person.name,
        character: c.character?.name || 'Main Cast',
        profileUrl: c.person.image?.medium || c.person.image?.original || null,
      }));

      return {
        title: data.name || seriesTitle,
        overview: data.summary ? data.summary.replace(/<[^>]*>?/gm, '') : `Official TV series listing for ${seriesTitle}.`,
        genres: data.genres && data.genres.length > 0 ? data.genres : ['Drama', 'Mystery'],
        rating: data.rating?.average || 8.5,
        posterUrl: data.image?.original || data.image?.medium || 'https://static.tvmaze.com/uploads/images/original_untouched/549/1374918.jpg',
        backdropUrl: bg?.resolutions?.original?.url || data.image?.original || 'https://static.tvmaze.com/uploads/images/original_untouched/549/1374917.jpg',
        premiered: data.premiered || '2026-01-01',
        cast,
      };
    }
  } catch (err) {
    console.warn(`[Auto-Indexer] Metadata notice for "${seriesTitle}":`, err.message);
  }

  return {
    title: seriesTitle,
    overview: `Official seasonal TV series streaming on CinePrimeSeries with confirmed multi-audio tracks.`,
    genres: ['Drama', 'Action'],
    rating: 8.5,
    posterUrl: 'https://static.tvmaze.com/uploads/images/original_untouched/549/1374918.jpg',
    backdropUrl: 'https://static.tvmaze.com/uploads/images/original_untouched/549/1374917.jpg',
    premiered: '2026-01-01',
    cast: [],
  };
}

// Index a file into catalog.json and MongoDB - STRICTLY GROUPS FILES INTO 1 SERIES
async function indexFileFromChannel(messageId, rawFileName, fileSize) {
  try {
    const sizeFormatted = formatFileSize(fileSize);

    // Read current catalog from disk
    let catalog = [];
    if (fs.existsSync(CATALOG_PATH)) {
      catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
    }

    // Determine currently active series (e.g. Heart Beat)
    let activeSeries = catalog.find((s) => s.slug === lastActiveSeriesSlug) || catalog[0] || null;

    // Parse the incoming file information
    const parsed = parseFileInfo(rawFileName, messageId, activeSeries);

    // Match existing series by:
    // 1. Exact slug match
    // 2. Case-insensitive title match
    // 3. Substring match
    let series = catalog.find((s) => {
      if (s.slug === parsed.slug) return true;
      if (s.title.toLowerCase() === parsed.seriesTitle.toLowerCase()) return true;
      if (s.title.toLowerCase().includes(parsed.seriesTitle.toLowerCase())) return true;
      if (parsed.seriesTitle.toLowerCase().includes(s.title.toLowerCase())) return true;
      return false;
    });

    // Deep link start payload format
    const startPayload = `get_${messageId}`;
    const botDeepLink = `https://t.me/${BOT_USERNAME}?start=${startPayload}`;

    // If series does not exist, fetch metadata and create ONE canonical series object
    if (!series) {
      console.log(`🔍 [Fetching Metadata] Fetching official TMDB/TVmaze details for "${parsed.seriesTitle}"...`);
      const meta = await fetchOfficialMetadata(parsed.seriesTitle);

      series = {
        id: `series-${parsed.slug}`,
        slug: parsed.slug,
        title: meta.title,
        originalTitle: meta.title,
        overview: meta.overview,
        originalLanguage: parsed.languages.includes('Tamil') ? 'Tamil' : 'English',
        originCountry: ['India'],
        genres: meta.genres,
        firstAirDate: meta.premiered,
        status: 'Returning Series',
        numberOfSeasons: parsed.seasonNumber || 3,
        currentSeasonNumber: parsed.seasonNumber || 3,
        seasonStatusText: `Season ${parsed.seasonNumber || 3} (Current Season)`,
        numberOfEpisodes: 1,
        rating: meta.rating,
        voteCount: 3500,
        ratingSource: 'IMDb',
        posterUrl: meta.posterUrl,
        backdropUrl: meta.backdropUrl,
        tmdbId: 0,
        tvmazeId: 0,
        trailerVideoId: parsed.slug === 'heart-beat' ? 'BXA6fsKUXFE' : null,
        creators: ['CinePrime Original'],
        productionCompanies: ['OTT Web Series'],
        tamilAudioStatus: 'Confirmed',
        tamilSubtitleStatus: 'Confirmed',
        downloadUrl: botDeepLink,
        telegramUrl: `https://t.me/CinePrimeSeries`,
        cast: meta.cast,
        files: [],
        seasons: [
          {
            seasonNumber: parsed.seasonNumber || 3,
            title: `Season ${parsed.seasonNumber || 3}`,
            episodeCount: 1,
            posterUrl: meta.posterUrl,
          },
        ],
      };
      catalog.push(series);
    }

    lastActiveSeriesSlug = series.slug;

    // Add or update file item in series.files
    const fileId = `tg-${messageId}`;
    const fileIndex = (series.files || []).findIndex(
      (f) => f.id === fileId || f.channelMessageId === messageId || f.fileName === parsed.cleanFileName
    );

    const fileItem = {
      id: fileId,
      seriesId: series.id,
      seriesSlug: series.slug,
      seriesTitle: series.title,
      fileName: parsed.cleanFileName,
      quality: parsed.quality,
      codec: parsed.codec,
      languages: parsed.languages,
      sizeFormatted,
      year: parsed.year,
      rating: series.rating,
      posterUrl: series.posterUrl,
      backdropUrl: series.backdropUrl,
      overview: series.overview,
      telegramUrl: botDeepLink,
      channelMessageId: messageId,
      dbChannelId: DB_CHANNEL_ID,
    };

    if (fileIndex !== -1) {
      series.files[fileIndex] = fileItem;
    } else {
      if (!series.files) series.files = [];
      series.files.unshift(fileItem);
    }

    // Update series season and episode count
    series.numberOfEpisodes = series.files.length;
    if (parsed.seasonNumber) {
      series.currentSeasonNumber = parsed.seasonNumber;
      series.seasonStatusText = `Season ${parsed.seasonNumber} (Current Season)`;
    }

    // 1. Save updated catalog to disk
    fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2), 'utf8');

    // 2. Save updated series & file into MongoDB Atlas if connected
    if (isMongoConnected && mongoDb) {
      try {
        await mongoDb.collection('series').updateOne(
          { slug: series.slug },
          { $set: series },
          { upsert: true }
        );
        await mongoDb.collection('files').updateOne(
          { id: fileItem.id },
          { $set: fileItem },
          { upsert: true }
        );
        console.log(`💾 [MongoDB Atlas Synced] Series "${series.title}" (Total files: ${series.files.length})`);
      } catch (mongoErr) {
        console.warn(`⚠️ MongoDB Atlas write notice:`, mongoErr.message);
      }
    }

    console.log(`\n🎉 [AUTO-INDEX SUCCESS - GROUPED INTO 1 SERIES]`);
    console.log(`   📁 File       : ${fileItem.fileName}`);
    console.log(`   🎬 Series     : ${series.title} (${series.seasonStatusText})`);
    console.log(`   🌟 Specs      : ${parsed.quality} | ${parsed.codec} | ${sizeFormatted}`);
    console.log(`   🏷️  Message ID : #${messageId} in Database Channel (${DB_CHANNEL_ID})`);
    console.log(`   🔗 Bot Link   : ${botDeepLink}`);
    console.log(`   🌐 Live Site  : http://localhost:3000/search?q=${encodeURIComponent(series.title)}\n`);
  } catch (err) {
    console.error('❌ Error indexing file into catalog:', err);
  }
}

// Find a file by deep link start payload (searches MongoDB & catalog.json)
async function findFileByPayload(payload) {
  // 1. Check MongoDB first if connected
  if (isMongoConnected && mongoDb) {
    try {
      if (payload.startsWith('get_')) {
        const msgId = parseInt(payload.replace('get_', ''), 10);
        const file = await mongoDb.collection('files').findOne({
          $or: [{ channelMessageId: msgId }, { id: `tg-${msgId}` }],
        });
        if (file) return file;
      } else {
        const cleanPayload = payload.replace('file_', '');
        const file = await mongoDb.collection('files').findOne({
          $or: [{ id: cleanPayload }, { id: payload }],
        });
        if (file) return file;
      }
    } catch (e) {
      // Fallback to catalog
    }
  }

  // 2. Fallback to catalog.json
  try {
    if (!fs.existsSync(CATALOG_PATH)) return null;
    const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));

    // Check payload: get_<message_id>
    if (payload.startsWith('get_')) {
      const msgId = parseInt(payload.replace('get_', ''), 10);
      for (const s of catalog) {
        for (const f of s.files || []) {
          if (f.channelMessageId === msgId || f.id === `tg-${msgId}`) {
            return f;
          }
        }
      }
      return { channelMessageId: msgId, fileName: 'Requested Series File' };
    }

    // Check payload: file_<id>
    const cleanPayload = payload.replace('file_', '');
    for (const s of catalog) {
      for (const f of s.files || []) {
        if (f.id === cleanPayload || f.id === payload || payload.includes(f.id)) {
          return f;
        }
      }
    }
  } catch (e) {
    console.error('Lookup error:', e);
  }
  return null;
}

// Send telegram message
async function sendTelegramMessage(chatId, text, replyMarkup = null) {
  try {
    const body = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    };
    if (replyMarkup) body.reply_markup = replyMarkup;

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error('Failed to send message:', err.message);
  }
}

// Copy file from Database Channel into User's Private Chat
async function copyFileToUserChat(userChatId, messageId, fileRecord = null) {
  try {
    console.log(`📤 [Sending File] Copying message #${messageId} from channel ${DB_CHANNEL_ID} to user chat ${userChatId}...`);

    const caption = fileRecord
      ? `🎬 <b>${fileRecord.fileName}</b>\n\n` +
        `🌟 <b>Quality:</b> ${fileRecord.quality}  |  <b>Codec:</b> ${fileRecord.codec}\n` +
        `📦 <b>Size:</b> ${fileRecord.sizeFormatted || 'Complete Episode'}\n` +
        `🔊 <b>Audio:</b> ${(fileRecord.languages || ['Tamil', 'Multi-Audio']).join(', ')}\n\n` +
        `✨ <i>Delivered directly by CinePrimeSeries Bot</i>\n` +
        `🌐 Visit Website: http://localhost:3000`
      : `🎬 <b>Here is your requested series file!</b>\n\n✨ <i>Powered by CinePrimeSeries</i>`;

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/copyMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: userChatId,
        from_chat_id: DB_CHANNEL_ID,
        message_id: messageId,
        caption,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🌐 Open CinePrimeSeries Website', url: 'http://localhost:3000' },
              { text: '📢 Telegram Channel', url: 'https://t.me/CinePrimeSeries' },
            ],
          ],
        },
      }),
    });

    const data = await res.json();
    if (data.ok) {
      console.log(`✅ [File Delivered Successfully] Message #${messageId} copied to user chat ${userChatId}!`);
      return true;
    } else {
      console.warn(`⚠️ Telegram copyMessage response:`, data);
      await sendTelegramMessage(
        userChatId,
        `⚠️ <b>File Retrieval Notice:</b>\n\nMessage #${messageId} could not be copied directly.\nPlease verify the file exists in database channel: <code>${DB_CHANNEL_ID}</code>.\n\n🌐 Visit website: http://localhost:3000`
      );
      return false;
    }
  } catch (err) {
    console.error('❌ Failed to copyMessage:', err.message);
    return false;
  }
}

// Main Polling Loop
let offset = 0;

async function startBotDaemon() {
  console.log('================================================================');
  console.log('🤖 CINEPRIMESERIES TELEGRAM FILE STORE & AUTO-INDEXER BOT');
  console.log(`📡 Database Channel ID  : ${DB_CHANNEL_ID}`);
  console.log(`🤖 Bot Username        : @${BOT_USERNAME}`);
  console.log(`🌐 Website URL         : http://localhost:3000`);
  console.log(`🍃 MongoDB Database    : ${MONGODB_DATABASE}`);
  console.log('================================================================\n');

  // Initialize MongoDB connection
  await initMongoDB();

  // Verify connection to Telegram
  try {
    const meRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const meData = await meRes.json();
    if (!meData.ok) {
      console.error('❌ Failed to connect to Telegram with BOT_TOKEN:', meData);
      process.exit(1);
    }
    console.log(`✅ Telegram Bot Online: @${meData.result.username} (${meData.result.first_name})`);

    // Verify channel access
    const chatRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${DB_CHANNEL_ID}`);
    const chatData = await chatRes.json();
    if (chatData.ok) {
      console.log(`✅ Database Channel Verified: "${chatData.result.title}" (ID: ${chatData.result.id})`);
    } else {
      console.warn(`⚠️ Channel check warning for ${DB_CHANNEL_ID}:`, chatData.description);
    }

    console.log(`\n👂 Active Listeners:`);
    console.log(`   1) Forwarded / Posted files in Database Channel (${DB_CHANNEL_ID}) -> Auto Group into 1 Series with MongoDB`);
    console.log(`   2) Website "Get File in Telegram Bot" redirects (/start get_<id>) -> copyMessage delivery to user chat\n`);
  } catch (err) {
    console.error('❌ Initial connection error:', err.message);
  }

  // Infinite Polling Loop
  while (true) {
    try {
      const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}&timeout=25&allowed_updates=["channel_post","edited_channel_post","message"]`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.ok && data.result) {
        for (const update of data.result) {
          offset = update.update_id + 1;

          // CASE 1: File posted or forwarded in Database Channel (-1004461514415)
          const channelPost = update.channel_post || update.edited_channel_post;
          if (channelPost) {
            const chatIdStr = String(channelPost.chat.id);
            const targetIdStr = String(DB_CHANNEL_ID);

            // Verify it belongs to the database channel
            if (chatIdStr === targetIdStr || chatIdStr.includes('4461514415')) {
              const videoOrDoc = channelPost.video || channelPost.document || channelPost.audio;

              // Ignore non-media messages (e.g. standalone text headers like "👇" or promotional emojis)
              if (!videoOrDoc && (!channelPost.text || channelPost.text.length < 5 || channelPost.text.includes('👇'))) {
                continue;
              }

              const fileName =
                videoOrDoc?.file_name ||
                (channelPost.caption ? channelPost.caption.split('\n')[0] : null) ||
                (channelPost.text ? channelPost.text.split('\n')[0] : null) ||
                `Series_Episode_${channelPost.message_id}.mkv`;

              const fileSize = videoOrDoc?.file_size || 0;

              console.log(`📥 [Incoming File in Database Channel]`);
              console.log(`   Message ID : ${channelPost.message_id}`);
              console.log(`   File Name  : ${fileName}`);
              console.log(`   File Size  : ${formatFileSize(fileSize)}`);

              // Auto-index into MongoDB & catalog.json (strictly grouped into canonical series)
              await indexFileFromChannel(channelPost.message_id, fileName, fileSize);
            }
          }

          // CASE 2: User in Private Chat clicks "Get File in Telegram" (/start get_<id>)
          const userMsg = update.message;
          if (userMsg && userMsg.chat.type === 'private' && userMsg.text) {
            const text = userMsg.text.trim();
            const userChatId = userMsg.chat.id;
            const userName = userMsg.from?.first_name || 'Friend';

            console.log(`📩 [User Message] From: ${userName} (${userChatId}) | Text: "${text}"`);

            if (text.startsWith('/start')) {
              const parts = text.split(' ');
              const payload = parts[1]?.trim();

              if (payload) {
                console.log(`🎯 [File Request Detected] Payload: "${payload}"`);

                await sendTelegramMessage(
                  userChatId,
                  `🔍 <b>Searching CinePrimeSeries Database...</b>\n\nFetching your requested series file. Please wait a moment...`
                );

                const fileRecord = await findFileByPayload(payload);
                let messageId = null;

                if (payload.startsWith('get_')) {
                  messageId = parseInt(payload.replace('get_', ''), 10);
                } else if (fileRecord && fileRecord.channelMessageId) {
                  messageId = fileRecord.channelMessageId;
                }

                if (messageId) {
                  await copyFileToUserChat(userChatId, messageId, fileRecord);
                } else {
                  await sendTelegramMessage(
                    userChatId,
                    `🎬 <b>File Found in Index!</b>\n\n` +
                      `📄 <b>${fileRecord?.fileName || 'Series Episode'}</b>\n` +
                      `🌟 Quality: ${fileRecord?.quality || '1080P'} | Codec: ${fileRecord?.codec || 'AVC'}\n` +
                      `📦 Size: ${fileRecord?.sizeFormatted || 'Standard Web-DL'}\n\n` +
                      `⚠️ <i>To receive this specific episode via instant copy, forward the file into the Database Channel (-1004461514415). It will be indexed automatically!</i>\n\n` +
                      `🌐 Website: http://localhost:3000`
                  );
                }
              } else {
                // Simple /start greeting
                await sendTelegramMessage(
                  userChatId,
                  `👋 <b>Hello ${userName}! Welcome to CinePrimeSeries!</b>\n\n` +
                    `🎬 <b>Strictly TV & Web Series Only!</b>\n` +
                    `Browse thousands of episodes, confirmed Tamil audio, and official trailers on our website:\n\n` +
                    `🌐 <b>Website:</b> http://localhost:3000\n` +
                    `📢 <b>Channel:</b> https://t.me/CinePrimeSeries\n\n` +
                    `<i>To get any file, simply click "Get File in Telegram Bot" on the website, and I will deliver the file directly into this chat!</i>`,
                  {
                    inline_keyboard: [
                      [
                        { text: '🌐 Open CinePrimeSeries Website', url: 'http://localhost:3000' },
                        { text: '📢 Official Channel', url: 'https://t.me/CinePrimeSeries' },
                      ],
                    ],
                  }
                );
              }
            }
          }
        }
      }
    } catch (pollErr) {
      // Network retry after 3 seconds
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

startBotDaemon();
