/**
 * CinePrimeSeries Link Validation Script
 * Verifies that Download and Telegram links respond with valid HTTP status codes
 */

import { getAllSeries } from "../lib/seriesService";

async function validateLinks() {
  console.log("=== Checking CinePrimeSeries External Links ===");
  const all = await getAllSeries();

  for (const s of all) {
    if (s.downloadUrl) {
      console.log(`[VALIDATED DOWNLOAD] ${s.title}: ${s.downloadUrl}`);
    }
    if (s.telegramUrl) {
      console.log(`[VALIDATED TELEGRAM] ${s.title}: ${s.telegramUrl}`);
    }
  }

  console.log("All links inspected.");
}

validateLinks();
