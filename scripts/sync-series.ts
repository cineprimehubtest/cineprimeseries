/**
 * CinePrimeSeries Background Synchronization Utility
 * Usage: npx ts-node scripts/sync-series.ts
 */

import { getTrendingSeries, getTopRatedSeries } from "../lib/tmdb";
import { searchTVmazeShows } from "../lib/tvmaze";
import { upsertSeries } from "../lib/seriesService";

async function runSync() {
  console.log("=== Starting CinePrimeSeries TV Metadata Sync ===");

  try {
    console.log("Fetching trending TV series from TMDB...");
    const trending = await getTrendingSeries(1);
    console.log(`Retrieved ${trending.length} trending series.`);

    for (const item of trending) {
      console.log(`Syncing: ${item.title}...`);
      await upsertSeries(item);
    }

    console.log("Fetching top rated series...");
    const top = await getTopRatedSeries(1);
    for (const item of top) {
      await upsertSeries(item);
    }

    console.log("TV Metadata Sync completed successfully!");
  } catch (error) {
    console.error("Sync encountered an error:", error);
  }
}

runSync();
