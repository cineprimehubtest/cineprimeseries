export type SeriesStatus = "Returning Series" | "Ended" | "Canceled" | "In Production" | "Pilot" | "Running";

export type AudioVerificationStatus = "Confirmed" | "Not confirmed" | "Unavailable" | "Not checked";

export interface LeechedFileItem {
  id: string;
  seriesId: string;
  seriesSlug: string;
  seriesTitle: string;
  fileName: string;
  seasonNumber?: number;
  episodeNumber?: number;
  quality: "480P" | "720P" | "1080P" | "4K" | string;
  codec?: string; // e.g. "x264", "HEVC", "AVC", "FENiX", "WEB-DL"
  languages: string[]; // e.g. ["Tamil", "Telugu", "Hindi", "English"]
  sizeFormatted: string; // e.g. "526.74 MB", "1.4 GB"
  year?: string;
  rating?: number;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  overview?: string;
  telegramUrl: string; // direct telegram channel/message link
  downloadUrl?: string;
}

export interface LanguageVerification {
  language: string;
  type: "audio" | "subtitle";
  status: AudioVerificationStatus;
  source?: string;
  verifiedAt?: string;
  notes?: string;
}

export interface ExternalLinkItem {
  id?: string;
  type: "download" | "telegram_post" | "telegram_channel" | "telegram_bot" | "official";
  url: string;
  label?: string;
  quality?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  authorized: boolean;
  lastChecked?: string;
}

export interface CastMember {
  id: string | number;
  name: string;
  character: string;
  profileUrl?: string | null;
  biography?: string;
  birthday?: string;
  placeOfBirth?: string;
  creditType?: "cast" | "crew" | "creator";
}

export interface Episode {
  id: string | number;
  seriesId: string;
  seasonId?: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  synopsis?: string;
  airDate?: string;
  runtime?: number;
  stillUrl?: string | null;
  downloadUrl?: string | null;
  telegramUrl?: string | null;
  verified?: boolean;
}

export interface Season {
  id: string | number;
  seriesId: string;
  seasonNumber: number;
  title: string;
  airDate?: string;
  posterUrl?: string | null;
  episodeCount?: number;
  episodes?: Episode[];
}

export interface Series {
  id: string;
  slug: string;
  title: string;
  originalTitle?: string;
  overview: string;
  originalLanguage: string;
  originCountry: string[];
  genres: string[];
  firstAirDate?: string;
  lastAirDate?: string;
  status: SeriesStatus | string;
  numberOfSeasons: number;
  numberOfEpisodes?: number;
  rating?: number;
  voteCount?: number;
  ratingSource?: string;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  tmdbId?: number | null;
  tvmazeId?: number | null;
  trailerVideoId?: string | null;
  creators?: string[];
  productionCompanies?: string[];
  cast?: CastMember[];
  seasons?: Season[];
  episodes?: Episode[];
  files?: LeechedFileItem[];
  languageEvidence?: LanguageVerification[];
  externalLinks?: ExternalLinkItem[];
  downloadUrl?: string | null;
  telegramUrl?: string | null;
  tamilAudioStatus?: AudioVerificationStatus;
  tamilSubtitleStatus?: AudioVerificationStatus;
  isPublished?: boolean;
  syncedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SearchFilters {
  query?: string;
  genre?: string;
  language?: string;
  quality?: string;
  country?: string;
  year?: string;
  status?: string;
  tamilAudio?: boolean;
  page?: number;
  limit?: number;
}
