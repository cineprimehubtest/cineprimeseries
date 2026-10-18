const { test } = require("node:test");
const assert = require("node:assert");

// Test Slugify
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Test Genre Normalizer
function normalizeGenre(genre) {
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

test("slugify generates clean URL-safe slugs", () => {
  assert.strictEqual(slugify("Heart Beat (2024)"), "heart-beat-2024");
  assert.strictEqual(slugify("Stranger Things: Season 5!"), "stranger-things-season-5");
  assert.strictEqual(slugify("LOKI"), "loki");
});

test("normalizeGenre maps TV genres to 10 main categories", () => {
  assert.strictEqual(normalizeGenre("Science-Fiction"), "Sci-Fi");
  assert.strictEqual(normalizeGenre("Action & Adventure"), "Action");
  assert.strictEqual(normalizeGenre("Romantic Comedy"), "Comedy");
});

test("strict TV series rule ensures movies are rejected", () => {
  const validTVShows = [
    { title: "Heart Beat", type: "Scripted", numberOfSeasons: 3 },
    { title: "Loki", type: "Scripted", numberOfSeasons: 2 },
  ];

  const candidate = { title: "Avatar 2", type: "Movie", numberOfSeasons: 0 };
  const isTVSeries = (item) => item.numberOfSeasons > 0 && item.type !== "Movie";

  assert.strictEqual(isTVSeries(validTVShows[0]), true);
  assert.strictEqual(isTVSeries(validTVShows[1]), true);
  assert.strictEqual(isTVSeries(candidate), false);
});
