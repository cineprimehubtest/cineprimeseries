import { NextRequest, NextResponse } from "next/server";
import { searchSeries } from "@/lib/seriesService";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const genre = searchParams.get("genre") || "";
  const language = searchParams.get("language") || "";
  const country = searchParams.get("country") || "";
  const status = searchParams.get("status") || "";
  const year = searchParams.get("year") || "";
  const limit = parseInt(searchParams.get("limit") || "24", 10);

  try {
    const results = await searchSeries({
      query: q,
      genre: genre && genre !== "all" ? genre : undefined,
      language: language && language !== "all" ? language : undefined,
      country: country && country !== "all" ? country : undefined,
      status: status && status !== "all" ? status : undefined,
      year: year && year !== "all" ? year : undefined,
      limit,
    });

    return NextResponse.json({
      success: true,
      query: q,
      total: results.length,
      results: results.slice(0, limit),
    });
  } catch (error) {
    console.error("[API Search Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search TV series catalogue." },
      { status: 500 }
    );
  }
}
