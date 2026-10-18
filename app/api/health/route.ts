import { NextResponse } from "next/server";
import { validateEnv } from "@/lib/env";
import { testMongoConnection } from "@/lib/mongodb";

export async function GET() {
  const envValidation = validateEnv();

  // Test TVmaze API
  let tvmazeStatus = { ok: false, latencyMs: 0, error: "" };
  const tvmazeStart = Date.now();
  try {
    const res = await fetch("https://api.tvmaze.com/shows/1", { cache: "no-store" });
    tvmazeStatus = {
      ok: res.ok,
      latencyMs: Date.now() - tvmazeStart,
      error: res.ok ? "" : `Status: ${res.status}`,
    };
  } catch (err) {
    tvmazeStatus = {
      ok: false,
      latencyMs: Date.now() - tvmazeStart,
      error: (err as Error).message,
    };
  }

  // Test TMDB API
  let tmdbStatus = { ok: false, latencyMs: 0, error: "" };
  const tmdbKey = process.env.TMDB_API_KEY;
  if (tmdbKey) {
    const tmdbStart = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(
        `https://api.themoviedb.org/3/trending/tv/week?api_key=${tmdbKey}`,
        { signal: controller.signal, cache: "no-store" }
      );
      clearTimeout(timeoutId);
      tmdbStatus = {
        ok: res.ok,
        latencyMs: Date.now() - tmdbStart,
        error: res.ok ? "" : `Status: ${res.status}`,
      };
    } catch (err) {
      tmdbStatus = {
        ok: false,
        latencyMs: Date.now() - tmdbStart,
        error: (err as Error).message,
      };
    }
  }

  // Test Telegram Bot
  let telegramStatus = { ok: false, username: "", error: "" };
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (botToken) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.ok) {
        telegramStatus = {
          ok: true,
          username: data.result?.username || "CinePrimeSeries_bot",
          error: "",
        };
      } else {
        telegramStatus = {
          ok: false,
          username: "",
          error: data.description || "Token rejected",
        };
      }
    } catch (err) {
      telegramStatus = {
        ok: false,
        username: "",
        error: (err as Error).message,
      };
    }
  }

  // Test MongoDB Atlas
  const mongoStatus = await testMongoConnection();

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: envValidation,
    services: {
      mongoDb: mongoStatus,
      tvmaze: tvmazeStatus,
      tmdb: tmdbStatus,
      telegramBot: telegramStatus,
    },
  });
}
