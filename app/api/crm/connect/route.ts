import { NextRequest, NextResponse } from "next/server";
import { getGHLAuthorizationUrl } from "@/lib/gohighlevel";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 }
    );
  }

  try {
    // Generate OAuth authorization URL with session_id as state
    const authUrl = getGHLAuthorizationUrl(sessionId);

    console.log("🔵 Redirecting to CRM OAuth:", { sessionId });

    // Redirect to authorization page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("🔴 Failed to generate auth URL:", error);
    return NextResponse.json(
      { error: "Failed to initiate CRM connection" },
      { status: 500 }
    );
  }
}
