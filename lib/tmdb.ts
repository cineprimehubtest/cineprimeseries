import { Series, CastMember } from "@/types";
import { slugify } from "./tvmaze";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG_BASE = "https://image.tmdb.org/t/p";

// Map TMDB genre IDs to our standard genre names
export const TMDB_GENRE_MAP: Record<number, string> = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  10762: "Kids",
  9648: "Mystery",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western",
};

// Helper to safely fetch TMDB with timeout
async function fetchTMDB(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return null;

  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set("api_key", apiKey);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return await res.json();
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    console.warn(`[TMDB] Fetch failed or timed out for ${endpoint}:`, (err as Error).message);
    return null;
  }
}

// Convert TMDB TV item to standard Series format
export function formatTMDBSeries(item: any, videos?: any[], credits?: any): Series {
  // Extract official trailer
  let trailerId: string | null = null;
  if (videos && videos.length > 0) {
    const officialTrailer = videos.find(
      (v: any) => v.site === "YouTube" && v.type === "Trailer" && v.official
    );
    const anyTrailer = videos.find((v: any) => v.site === "YouTube" && v.type === "Trailer");
    const anyVideo = videos.find((v: any) => v.site === "YouTube");
    trailerId = (officialTrailer || anyTrailer || anyVideo)?.key || null;
  }

  // Extract cast
  const cast: CastMember[] = (credits?.cast || []).slice(0, 15).map((c: any) => ({
    id: c.id,
    name: c.name,
    character: c.character || "Cast",
    profileUrl: c.profile_path ? `${TMDB_IMG_BASE}/w300${c.profile_path}` : null,
    creditType: "cast",
  }));

  const creators = (item.created_by || []).map((c: any) => c.name);
  const productionCompanies = (item.production_companies || []).map((p: any) => p.name);

  const genres =
    item.genres?.map((g: any) => g.name) ||
    item.genre_ids?.map((id: number) => TMDB_GENRE_MAP[id] || "Drama") || [
      "Drama",
    ];

  return {
    id: `tmdb-${item.id}`,
    slug: slugify(item.name || "series"),
    title: item.name,
    originalTitle: item.original_name,
    overview: item.overview || "No overview available.",
    originalLanguage: item.original_language || "en",
    originCountry: item.origin_country || ["US"],
    genres: genres.length > 0 ? genres : ["Drama"],
    firstAirDate: item.first_air_date,
    lastAirDate: item.last_air_date,
    status: item.status || "Returning Series",
    numberOfSeasons: item.number_of_seasons || 1,
    numberOfEpisodes: item.number_of_episodes || 0,
    rating: item.vote_average ? Number(item.vote_average.toFixed(1)) : 8.0,
    voteCount: item.vote_count || 100,
    ratingSource: "TMDB",
    posterUrl: item.poster_path ? `${TMDB_IMG_BASE}/w500${item.poster_path}` : null,
    backdropUrl: item.backdrop_path ? `${TMDB_IMG_BASE}/original${item.backdrop_path}` : null,
    tmdbId: item.id,
    tvmazeId: null,
    trailerVideoId: trailerId,
    creators: creators.length > 0 ? creators : ["CinePrime Discovery"],
    productionCompanies: productionCompanies.length > 0 ? productionCompanies : ["Global Studios"],
    cast,
    isPublished: true,
  };
}

// Fetch trending TV series (weekly)
export async function getTrendingSeries(page = 1): Promise<Series[]> {
  const data = await fetchTMDB("/trending/tv/week", { page: String(page) });
  if (!data || !data.results) return [];
  return data.results.map((item: any) => formatTMDBSeries(item));
}

// Fetch top rated TV series
export async function getTopRatedSeries(page = 1): Promise<Series[]> {
  const data = await fetchTMDB("/tv/top_rated", { page: String(page) });
  if (!data || !data.results) return [];
  return data.results.map((item: any) => formatTMDBSeries(item));
}

// Fetch new / on the air TV series
export async function getNewSeries(page = 1): Promise<Series[]> {
  const data = await fetchTMDB("/tv/on_the_air", { page: String(page) });
  if (!data || !data.results) return [];
  return data.results.map((item: any) => formatTMDBSeries(item));
}

// Search TMDB for TV series only
export async function searchTMDBSeries(query: string, page = 1): Promise<Series[]> {
  if (!query || !query.trim()) return [];
  const data = await fetchTMDB("/search/tv", {
    query: query.trim(),
    page: String(page),
    include_adult: "false",
  });
  if (!data || !data.results) return [];
  return data.results.map((item: any) => formatTMDBSeries(item));
}

// Fetch detailed TV series with videos and credits
export async function getTMDBSeriesDetails(id: number): Promise<Series | null> {
  const details = await fetchTMDB(`/tv/${id}`, {
    append_to_response: "videos,credits",
  });
  if (!details) return null;
  return formatTMDBSeries(
    details,
    details.videos?.results || [],
    details.credits || {}
  );
}
