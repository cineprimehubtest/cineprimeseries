import { Series } from "@/types";
import { slugify } from "./tvmaze";

// Standard 10 Main Categories requested
export const MAIN_CATEGORIES = [
  { name: "Action", slug: "action", description: "High-octane action, chases, and adrenaline-pumping sequences." },
  { name: "Adventure", slug: "adventure", description: "Epic journeys, exploration, quests, and expeditions." },
  { name: "Comedy", slug: "comedy", description: "Laughs, sitcoms, parodies, and witty television comedy." },
  { name: "Crime", slug: "crime", description: "Detectives, heists, mafias, true crime, and police investigations." },
  { name: "Drama", slug: "drama", description: "Emotional depth, human conflict, and gripping narratives." },
  { name: "Fantasy", slug: "fantasy", description: "Magic, mythical realms, supernatural lore, and kingdoms." },
  { name: "Horror", slug: "horror", description: "Chilling suspense, terrifying creatures, and psychological frights." },
  { name: "Mystery", slug: "mystery", description: "Puzzles, enigmas, whodunits, and twists." },
  { name: "Romance", slug: "romance", description: "Love stories, relationships, emotional connections, and passion." },
  { name: "Sci-Fi", slug: "sci-fi", description: "Futuristic science, space travel, AI, and alternate realities." },
];

// Normalize language codes
export function normalizeLanguage(lang?: string): string {
  if (!lang) return "English";
  const l = lang.toLowerCase().trim();
  if (l === "en" || l === "eng" || l === "english") return "English";
  if (l === "ta" || l === "tam" || l === "tamil") return "Tamil";
  if (l === "te" || l === "tel" || l === "telugu") return "Telugu";
  if (l === "ml" || l === "mal" || l === "malayalam") return "Malayalam";
  if (l === "hi" || l === "hin" || l === "hindi") return "Hindi";
  if (l === "ko" || l === "kor" || l === "korean") return "Korean";
  if (l === "ja" || l === "jpn" || l === "japanese") return "Japanese";
  if (l === "es" || l === "spa" || l === "spanish") return "Spanish";
  if (l === "fr" || l === "fra" || l === "french") return "French";
  if (l === "de" || l === "ger" || l === "german") return "German";
  return lang.charAt(0).toUpperCase() + lang.slice(1);
}

// Normalize genre names to match our taxonomy
export function normalizeGenre(genre: string): string {
  const g = genre.toLowerCase();
  if (g.includes("sci-fi") || g.includes("science")) return "Sci-Fi";
  if (g.includes("action")) return "Action";
  if (g.includes("adventure")) return "Adventure";
  if (g.includes("comedy")) return "Comedy";
  if (g.includes("crime")) return "Crime";
  if (g.includes("fantasy")) return "Fantasy";
  if (g.includes("horror")) return "Horror";
  if (g.includes("mystery")) return "Mystery";
  if (g.includes("romance")) return "Romance";
  if (g.includes("drama")) return "Drama";
  return genre;
}

// Check if two series match
export function isSameSeries(a: Partial<Series>, b: Partial<Series>): boolean {
  if (a.tmdbId && b.tmdbId && a.tmdbId === b.tmdbId) return true;
  if (a.tvmazeId && b.tvmazeId && a.tvmazeId === b.tvmazeId) return true;

  if (a.title && b.title) {
    const slugA = slugify(a.title);
    const slugB = slugify(b.title);
    if (slugA === slugB) {
      if (a.firstAirDate && b.firstAirDate) {
        const yearA = a.firstAirDate.substring(0, 4);
        const yearB = b.firstAirDate.substring(0, 4);
        return yearA === yearB;
      }
      return true;
    }
  }
  return false;
}

// Merge series data from complementary sources
export function mergeSeriesData(base: Series, overlay: Partial<Series>): Series {
  return {
    ...base,
    originalTitle: overlay.originalTitle || base.originalTitle,
    overview: base.overview && base.overview.length > (overlay.overview?.length || 0)
      ? base.overview
      : overlay.overview || base.overview,
    posterUrl: base.posterUrl || overlay.posterUrl || null,
    backdropUrl: overlay.backdropUrl || base.backdropUrl || null,
    trailerVideoId: overlay.trailerVideoId || base.trailerVideoId || null,
    tmdbId: overlay.tmdbId || base.tmdbId || null,
    tvmazeId: overlay.tvmazeId || base.tvmazeId || null,
    genres: Array.from(new Set([...(base.genres || []), ...(overlay.genres || [])])).map(normalizeGenre),
    cast: base.cast && base.cast.length > 0 ? base.cast : overlay.cast || [],
    seasons: base.seasons && base.seasons.length > 0 ? base.seasons : overlay.seasons || [],
    episodes: base.episodes && base.episodes.length > 0 ? base.episodes : overlay.episodes || [],
    rating: overlay.rating || base.rating,
    downloadUrl: base.downloadUrl || overlay.downloadUrl || null,
    telegramUrl: base.telegramUrl || overlay.telegramUrl || null,
    tamilAudioStatus: base.tamilAudioStatus || overlay.tamilAudioStatus || "Not checked",
    tamilSubtitleStatus: base.tamilSubtitleStatus || overlay.tamilSubtitleStatus || "Not checked",
  };
}
