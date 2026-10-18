import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { secret } = await req.json();
    const adminSecret = process.env.ADMIN_AUTH_SECRET;

    if (!adminSecret) {
      return NextResponse.json(
        { success: false, message: "ADMIN_AUTH_SECRET is not configured on server." },
        { status: 500 }
      );
    }

    if (secret === adminSecret) {
      const response = NextResponse.json({
        success: true,
        message: "Admin authentication successful.",
      });

      // Set cookie for authenticated session
      response.cookies.set("cineprime_admin_session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: "Invalid administrator secret passphrase." },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Authentication request failed." },
      { status: 500 }
    );
  }
}
