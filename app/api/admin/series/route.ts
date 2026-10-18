import { NextRequest, NextResponse } from "next/server";
import {
  getAllSeries,
  upsertSeries,
  deleteSeries,
  enrichAndAddLeechedSeries,
} from "@/lib/seriesService";
import { Series } from "@/types";

// Auth helper
function isAuthorized(req: NextRequest): boolean {
  const cookie = req.cookies.get("cineprime_admin_session")?.value;
  const headerSecret = req.headers.get("x-admin-secret");
  const adminSecret = process.env.ADMIN_AUTH_SECRET;

  if (cookie === "authenticated") return true;
  if (adminSecret && headerSecret === adminSecret) return true;
  return false;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const all = await getAllSeries();
  return NextResponse.json({ success: true, count: all.length, series: all });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      action,
      title,
      tmdbId,
      tvmazeId,
      telegramChannelUrl,
      downloadUrl,
      tamilAudioStatus,
      seriesData,
      slugOrId,
    } = body;

    // Action 1: Add Leeched Series with Automatic Category Assignment
    if (action === "add_leeched" && (title || tmdbId || tvmazeId)) {
      const result = await enrichAndAddLeechedSeries({
        title: title?.trim(),
        tmdbId: tmdbId ? Number(tmdbId) : undefined,
        tvmazeId: tvmazeId ? Number(tvmazeId) : undefined,
        telegramChannelUrl: telegramChannelUrl?.trim(),
        downloadUrl: downloadUrl?.trim(),
        tamilAudioStatus,
      });

      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    // Action 2: Delete a series from catalog
    if (action === "delete" && slugOrId) {
      await deleteSeries(slugOrId);
      return NextResponse.json({ success: true, message: `Removed series from catalogue.` });
    }

    // Action 3: Manual save/update series
    if (seriesData && seriesData.slug) {
      await upsertSeries(seriesData as Series);
      return NextResponse.json({
        success: true,
        message: `Saved updates for ${seriesData.title}`,
        series: seriesData,
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action or parameters." },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, message: (err as Error).message },
      { status: 500 }
    );
  }
}
