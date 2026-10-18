import { Series, Season, Episode, CastMember } from "@/types";

const TVMAZE_BASE = "https://api.tvmaze.com";

// Helper to strip HTML tags from TVmaze summaries
export function stripHtml(html?: string | null): string {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").trim();
}

// Generate URL slug from title
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface TVmazeShowItem {
  id: number;
  name: string;
  type?: string;
  language?: string;
  genres?: string[];
  status?: string;
  runtime?: number;
  premiered?: string;
  ended?: string;
  officialSite?: string;
  rating?: { average?: number };
  network?: { name?: string; country?: { name?: string; code?: string } };
  webChannel?: { name?: string; country?: { name?: string; code?: string } };
  image?: { medium?: string; original?: string };
  summary?: string;
  _embedded?: {
    seasons?: Array<{
      id: number;
      number: number;
      name?: string;
      episodeOrder?: number;
      premiereDate?: string;
      image?: { medium?: string; original?: string };
    }>;
    episodes?: Array<{
      id: number;
      season: number;
      number: number;
      name: string;
      airdate?: string;
      runtime?: number;
      image?: { medium?: string; original?: string };
      summary?: string;
    }>;
    cast?: Array<{
      person: {
        id: number;
        name: string;
        image?: { medium?: string; original?: string };
      };
      character: {
        name: string;
      };
    }>;
  };
}

export function formatTVmazeShow(item: TVmazeShowItem): Series {
  const seasons: Season[] = (item._embedded?.seasons || []).map((s) => ({
    id: s.id,
    seriesId: String(item.id),
    seasonNumber: s.number,
    title: s.name || `Season ${s.number}`,
    airDate: s.premiereDate || undefined,
    posterUrl: s.image?.original || s.image?.medium || item.image?.original || null,
    episodeCount: s.episodeOrder || undefined,
  }));

  const episodes: Episode[] = (item._embedded?.episodes || []).map((ep) => ({
    id: ep.id,
    seriesId: String(item.id),
    seasonNumber: ep.season,
    episodeNumber: ep.number,
    title: ep.name || `Episode ${ep.number}`,
    synopsis: stripHtml(ep.summary),
    airDate: ep.airdate || undefined,
    runtime: ep.runtime || item.runtime || undefined,
    stillUrl: ep.image?.original || ep.image?.medium || null,
    downloadUrl: null,
    telegramUrl: null,
  }));

  const cast: CastMember[] = (item._embedded?.cast || []).slice(0, 15).map((c) => ({
    id: c.person.id,
    name: c.person.name,
    character: c.character.name,
    profileUrl: c.person.image?.original || c.person.image?.medium || null,
    creditType: "cast",
  }));

  const country =
    item.network?.country?.name ||
    item.webChannel?.country?.name ||
    (item.language === "Tamil" || item.language === "Hindi" || item.language === "Telugu"
      ? "India"
      : item.language === "Korean"
      ? "South Korea"
      : item.language === "Japanese"
      ? "Japan"
      : "United States");

  return {
    id: `tvmaze-${item.id}`,
    slug: slugify(item.name),
    title: item.name,
    overview: stripHtml(item.summary),
    originalLanguage: item.language || "English",
    originCountry: [country],
    genres: item.genres && item.genres.length > 0 ? item.genres : ["Drama"],
    firstAirDate: item.premiered || undefined,
    lastAirDate: item.ended || undefined,
    status: item.status === "Running" ? "Returning Series" : item.status || "Ended",
    numberOfSeasons: seasons.length > 0 ? seasons.length : 1,
    numberOfEpisodes: episodes.length,
    rating: item.rating?.average ? Number((item.rating.average).toFixed(1)) : 8.2,
    voteCount: item.rating?.average ? 1200 : undefined,
    ratingSource: "TVmaze / IMDb",
    posterUrl: item.image?.original || item.image?.medium || null,
    backdropUrl: item.image?.original || null,
    tvmazeId: item.id,
    tmdbId: null,
    trailerVideoId: null,
    creators: [item.network?.name || item.webChannel?.name || "Original Production"],
    productionCompanies: [item.network?.name || item.webChannel?.name || "Global Studio"],
    cast,
    seasons,
    episodes,
    isPublished: true,
  };
}

const TVMAZE_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CinePrimeSeries/1.0",
  Accept: "application/json",
};

// Fetch single show by TVmaze ID with embedded details
export async function getTVmazeShow(id: number): Promise<Series | null> {
  try {
    const res = await fetch(
      `${TVMAZE_BASE}/shows/${id}?embed[]=seasons&embed[]=episodes&embed[]=cast`,
      {
        headers: TVMAZE_HEADERS,
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return null;
    const data: TVmazeShowItem = await res.json();
    return formatTVmazeShow(data);
  } catch (error) {
    console.error(`[TVmaze] Error fetching show ${id}:`, error);
    return null;
  }
}

// Search TVmaze for shows (Series only!)
export async function searchTVmazeShows(query: string): Promise<Series[]> {
  if (!query || !query.trim()) return [];
  try {
    const res = await fetch(
      `${TVMAZE_BASE}/search/shows?q=${encodeURIComponent(query.trim())}`,
      {
        headers: TVMAZE_HEADERS,
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) return [];
    const data: Array<{ score: number; show: TVmazeShowItem }> = await res.json();
    return data.map((item) => formatTVmazeShow(item.show));
  } catch (error) {
    console.error(`[TVmaze] Error searching shows for query "${query}":`, error);
    return [];
  }
}

// Fetch latest episode schedule from TVmaze
export async function getTVmazeLatestSchedule(countryCode = "US"): Promise<Episode[]> {
  try {
    const res = await fetch(`${TVMAZE_BASE}/schedule?country=${countryCode}`, {
      headers: TVMAZE_HEADERS,
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.slice(0, 12).map((item: any) => ({
      id: item.id,
      seriesId: `tvmaze-${item.show?.id}`,
      seasonNumber: item.season,
      episodeNumber: item.number,
      title: `${item.show?.name || "Series"}: ${item.name || `Episode ${item.number}`}`,
      synopsis: stripHtml(item.summary),
      airDate: item.airdate,
      runtime: item.runtime,
      stillUrl: item.image?.original || item.image?.medium || item.show?.image?.medium || null,
      downloadUrl: null,
      telegramUrl: null,
    }));
  } catch (error) {
    console.error("[TVmaze] Schedule fetch error:", error);
    return [];
  }
}
