import fs from "fs";
import path from "path";
import { Series, SearchFilters } from "@/types";
import { getDb } from "./mongodb";
import { INITIAL_SERIES } from "./seedData";
import { searchTVmazeShows, getTVmazeShow } from "./tvmaze";
import { getTMDBSeriesDetails, searchTMDBSeries } from "./tmdb";
import { isSameSeries, mergeSeriesData, normalizeGenre, MAIN_CATEGORIES } from "./matching";

const CATALOG_FILE_PATH = path.join(process.cwd(), "data", "catalog.json");

// Helper to load persistent catalog from disk
function loadLocalCatalog(): Series[] {
  try {
    if (fs.existsSync(CATALOG_FILE_PATH)) {
      const content = fs.readFileSync(CATALOG_FILE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("[Catalog] Error loading local catalog:", err);
  }
  return [];
}

// Helper to save persistent catalog to disk
function saveLocalCatalog(list: Series[]) {
  try {
    const dir = path.dirname(CATALOG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CATALOG_FILE_PATH, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("[Catalog] Error saving local catalog:", err);
  }
}

// In-memory catalog initialized from local file or seed
let inMemorySeries: Series[] = loadLocalCatalog();

function deduplicateSeries(list: Series[]): Series[] {
  const map = new Map<string, Series>();
  for (const s of list) {
    if (!s || !s.slug) continue;
    const key = s.slug.toLowerCase().trim();
    if (!map.has(key)) {
      map.set(key, { ...s });
    } else {
      const existing = map.get(key)!;
      const combinedFiles = [...(existing.files || []), ...(s.files || [])];
      const fileMap = new Map();
      combinedFiles.forEach((f) => {
        const k = f.channelMessageId || f.id;
        if (!fileMap.has(k)) fileMap.set(k, f);
      });
      existing.files = Array.from(fileMap.values());
      existing.numberOfEpisodes = existing.files.length;
    }
  }
  return Array.from(map.values());
}

// Retrieve all series currently published in user's leeched catalogue
export async function getAllSeries(): Promise<Series[]> {
  try {
    const db = await getDb();
    if (db) {
      const docs = await db.collection<Series>("series").find({}).toArray();
      if (docs && docs.length > 0) {
        const mapped = docs.map((d: any) => ({ ...d, id: d.id || String(d._id) }));
        return deduplicateSeries(mapped);
      }
    }
  } catch (error) {
    console.warn("[SeriesService] Falling back to local catalog:", (error as Error).message);
  }
  return deduplicateSeries(loadLocalCatalog());
}

// Find single series by slug
export async function getSeriesBySlug(slug: string): Promise<Series | null> {
  const cleanSlug = slug.toLowerCase().trim();
  try {
    const db = await getDb();
    if (db) {
      const doc = await db.collection<Series>("series").findOne({ slug: cleanSlug });
      if (doc) return { ...doc, id: doc.id || String(doc._id) };
    }
  } catch (err) {
    console.warn("[SeriesService] DB lookup error:", (err as Error).message);
  }

  const found = loadLocalCatalog().find((s) => s.slug === cleanSlug);
  return found || null;
}

// Trending series among user's leeched series
export async function getTrending(): Promise<Series[]> {
  const all = await getAllSeries();
  return [...all].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
}

// Top rated series among user's leeched series
export async function getTopRated(): Promise<Series[]> {
  const all = await getAllSeries();
  return [...all].sort((a, b) => (b.rating || 0) - (a.rating || 0));
}

// Newly added series among user's leeched series
export async function getNewReleases(): Promise<Series[]> {
  const all = await getAllSeries();
  return [...all].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.firstAirDate || "1970-01-01").getTime();
    const dateB = new Date(b.updatedAt || b.firstAirDate || "1970-01-01").getTime();
    return dateB - dateA;
  });
}

// Get leeched series belonging to a category (categories automatically matched)
export async function getSeriesByCategory(category: string): Promise<Series[]> {
  const catLower = category.toLowerCase().trim();
  const all = await getAllSeries();
  return all.filter((s) =>
    s.genres.some((g) => g.toLowerCase().includes(catLower))
  );
}

// Get leeched series belonging to a language
export async function getSeriesByLanguage(lang: string): Promise<Series[]> {
  const langLower = lang.toLowerCase().trim();
  const all = await getAllSeries();
  return all.filter((s) => {
    const matchesOrig = s.originalLanguage.toLowerCase().includes(langLower);
    const matchesTamil =
      langLower.includes("tamil") &&
      (s.tamilAudioStatus === "Confirmed" || s.tamilSubtitleStatus === "Confirmed");
    return matchesOrig || matchesTamil;
  });
}

// Search strictly within user's leeched catalogue
export async function searchSeries(filters: SearchFilters): Promise<Series[]> {
  const { query, genre, language, country, year, status } = filters;
  const list = await getAllSeries();

  return list.filter((s) => {
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchOrig = s.originalTitle?.toLowerCase().includes(q);
      const matchOverview = s.overview.toLowerCase().includes(q);
      const matchFiles = s.files?.some(
        (f) =>
          f.fileName.toLowerCase().includes(q) ||
          f.quality.toLowerCase().includes(q) ||
          (f.codec && f.codec.toLowerCase().includes(q)) ||
          f.languages.some((l) => l.toLowerCase().includes(q))
      );
      if (!matchTitle && !matchOrig && !matchOverview && !matchFiles) return false;
    }

    if (genre && genre !== "all") {
      const g = genre.toLowerCase();
      if (!s.genres.some((item) => item.toLowerCase().includes(g))) return false;
    }

    if (language && language !== "all") {
      const l = language.toLowerCase();
      const matchOrig = s.originalLanguage.toLowerCase() === l;
      const matchTamil = l === "tamil" && s.tamilAudioStatus === "Confirmed";
      if (!matchOrig && !matchTamil) return false;
    }

    if (country && country !== "all") {
      const c = country.toLowerCase();
      if (!s.originCountry.some((cnt) => cnt.toLowerCase().includes(c))) return false;
    }

    if (year && year !== "all") {
      if (!s.firstAirDate || !s.firstAirDate.startsWith(year)) return false;
    }

    if (status && status !== "all") {
      const st = status.toLowerCase();
      if (!s.status.toLowerCase().includes(st)) return false;
    }

    return true;
  });
}

// Save or update series in user's leeched catalogue
export async function upsertSeries(series: Series): Promise<boolean> {
  const idx = inMemorySeries.findIndex((s) => s.id === series.id || s.slug === series.slug);
  const updatedSeries = {
    ...series,
    genres: (series.genres || ["Drama"]).map(normalizeGenre),
    updatedAt: new Date().toISOString(),
  };

  if (idx >= 0) {
    inMemorySeries[idx] = mergeSeriesData(inMemorySeries[idx], updatedSeries);
  } else {
    inMemorySeries.push(updatedSeries);
  }

  // Persist locally
  saveLocalCatalog(inMemorySeries);

  // Persist to MongoDB Atlas if connected
  try {
    const db = await getDb();
    if (db) {
      await db.collection("series").updateOne(
        { slug: series.slug },
        { $set: inMemorySeries.find((s) => s.slug === series.slug) },
        { upsert: true }
      );
    }
  } catch (error) {
    console.warn("[SeriesService] MongoDB Atlas sync error:", error);
  }

  return true;
}

// Remove series from user's leeched catalogue
export async function deleteSeries(slugOrId: string): Promise<boolean> {
  inMemorySeries = inMemorySeries.filter((s) => s.slug !== slugOrId && s.id !== slugOrId);
  saveLocalCatalog(inMemorySeries);

  try {
    const db = await getDb();
    if (db) {
      await db.collection("series").deleteOne({
        $or: [{ slug: slugOrId }, { id: slugOrId }],
      });
    }
  } catch (err) {
    console.warn("[SeriesService] MongoDB delete error:", err);
  }
  return true;
}

// Automatic metadata fetching & category detection when user adds a leeched series
export async function enrichAndAddLeechedSeries(params: {
  title: string;
  tmdbId?: number;
  tvmazeId?: number;
  telegramChannelUrl?: string;
  downloadUrl?: string;
  tamilAudioStatus?: "Confirmed" | "Not confirmed" | "Unavailable" | "Not checked";
}): Promise<{ success: boolean; series?: Series; message?: string }> {
  const { title, tmdbId, tvmazeId, telegramChannelUrl, downloadUrl, tamilAudioStatus } = params;

  let baseSeries: Series | null = null;

  // 1. Try TMDB if ID provided
  if (tmdbId) {
    baseSeries = await getTMDBSeriesDetails(Number(tmdbId));
  }

  // 2. Try TVmaze if ID provided
  if (!baseSeries && tvmazeId) {
    baseSeries = await getTVmazeShow(Number(tvmazeId));
  }

  // 3. Check verified seed records by title
  if (!baseSeries && title) {
    const qClean = title.toLowerCase().trim();
    const seedMatch = INITIAL_SERIES.find(
      (s) => s.title.toLowerCase().includes(qClean) || s.slug.toLowerCase().includes(qClean)
    );
    if (seedMatch) {
      baseSeries = { ...seedMatch };
    }
  }

  // 4. Search TVmaze by title
  if (!baseSeries && title) {
    const tvmazeResults = await searchTVmazeShows(title);
    if (tvmazeResults.length > 0 && tvmazeResults[0].tvmazeId) {
      baseSeries = await getTVmazeShow(tvmazeResults[0].tvmazeId);
    }
  }

  // 4. Search TMDB by title
  if (!baseSeries && title) {
    const tmdbResults = await searchTMDBSeries(title);
    if (tmdbResults.length > 0 && tmdbResults[0].tmdbId) {
      baseSeries = await getTMDBSeriesDetails(tmdbResults[0].tmdbId);
    }
  }

  if (!baseSeries) {
    return {
      success: false,
      message: `Could not find verified TV series metadata for "${title}". Please check title spelling or provide TMDB / TVmaze ID.`,
    };
  }

  // Apply User's Telegram channel, download links, and Tamil audio status
  baseSeries.telegramUrl = telegramChannelUrl || baseSeries.telegramUrl || "https://t.me/CinePrimeSeries";
  baseSeries.downloadUrl = downloadUrl || baseSeries.downloadUrl || null;
  baseSeries.tamilAudioStatus = tamilAudioStatus || baseSeries.tamilAudioStatus || "Not checked";

  // Automatically ensure all genres map cleanly to 10 main categories
  baseSeries.genres = Array.from(new Set(baseSeries.genres.map(normalizeGenre)));

  // If series has seasons/episodes, attach Telegram links to episodes
  if (baseSeries.seasons) {
    baseSeries.seasons.forEach((season) => {
      if (season.episodes) {
        season.episodes.forEach((ep) => {
          if (!ep.telegramUrl) ep.telegramUrl = baseSeries?.telegramUrl || null;
          if (!ep.downloadUrl && baseSeries?.downloadUrl) ep.downloadUrl = baseSeries.downloadUrl;
        });
      }
    });
  }

  await upsertSeries(baseSeries);

  return {
    success: true,
    series: baseSeries,
    message: `Successfully indexed "${baseSeries.title}"! Categories automatically assigned: ${baseSeries.genres.join(", ")}`,
  };
}
