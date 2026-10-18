/**
 * CinePrimeSeries Environment Variable Configuration & Validation
 * Validates critical environment variables safely without leaking secrets to the client.
 */

export interface EnvConfig {
  TELEGRAM_BOT_TOKEN: string;
  TMDB_API_KEY: string;
  TVMAZE_API_KEY?: string;
  MONGODB_URI: string;
  MONGODB_DATABASE: string;
  TELEGRAM_BOT_USERNAME: string;
  TELEGRAM_CHANNEL_URL: string;
  ADMIN_AUTH_SECRET: string;
}

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
  configured: string[];
}

export function validateEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];
  const configured: string[] = [];

  const check = (key: string, required = true, isWarningOnly = false) => {
    const val = process.env[key];
    if (val && val.trim().length > 0) {
      configured.push(key);
    } else {
      if (required) {
        missing.push(key);
      } else if (isWarningOnly) {
        warnings.push(key);
      }
    }
  };

  // Critical variables
  check("TELEGRAM_BOT_TOKEN", true);
  check("TMDB_API_KEY", true);
  check("MONGODB_URI", true);
  check("MONGODB_DATABASE", false); // has default fallback
  check("TELEGRAM_BOT_USERNAME", false); // has default
  check("TELEGRAM_CHANNEL_URL", false); // has default
  check("ADMIN_AUTH_SECRET", true);

  // Optional variables
  check("TVMAZE_API_KEY", false, true); // TVmaze public API does not strictly require an API key

  return {
    valid: missing.length === 0,
    missing,
    warnings,
    configured,
  };
}

export function getEnv(): EnvConfig {
  const validation = validateEnv();
  if (!validation.valid && process.env.NODE_ENV === "production") {
    console.error(
      `[CRITICAL CONFIG ERROR] Missing required environment variables: ${validation.missing.join(", ")}. Please configure them in Vercel project settings or .env.local.`
    );
  }

  return {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "",
    TMDB_API_KEY: process.env.TMDB_API_KEY || "",
    TVMAZE_API_KEY: process.env.TVMAZE_API_KEY || "",
    MONGODB_URI: process.env.MONGODB_URI || "",
    MONGODB_DATABASE: process.env.MONGODB_DATABASE || "CinePrimeSeries",
    TELEGRAM_BOT_USERNAME: (process.env.TELEGRAM_BOT_USERNAME || "CinePrimeSeries_bot").replace("@", ""),
    TELEGRAM_CHANNEL_URL: process.env.TELEGRAM_CHANNEL_URL || "https://t.me/CinePrimeSeries",
    ADMIN_AUTH_SECRET: process.env.ADMIN_AUTH_SECRET || "admin-secret-dev-placeholder",
  };
}
