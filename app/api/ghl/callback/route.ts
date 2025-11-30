import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, getLocationInfo } from "@/lib/gohighlevel";
import { supabase } from "@/lib/supabase";
import { GHLConnectionRow } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // This should be the session_id
  const error = searchParams.get("error");

  console.log("🔵 GHL OAuth callback received", { code: !!code, state, error });

  // Handle OAuth error
  if (error) {
    console.error("🔴 OAuth error:", error);
    return NextResponse.redirect(
      new URL(`/?ghl_error=${encodeURIComponent(error)}`, request.url)
    );
  }

  // Validate required params
  if (!code || !state) {
    console.error("🔴 Missing code or state");
    return NextResponse.redirect(
      new URL("/?ghl_error=missing_parameters", request.url)
    );
  }

  try {
    // Exchange authorization code for access token
    console.log("🔵 Exchanging code for token...");
    const tokenResponse = await exchangeCodeForToken(code);

    console.log("✅ Token received", {
      locationId: tokenResponse.locationId,
      companyId: tokenResponse.companyId,
      expiresIn: tokenResponse.expires_in,
    });

    // Get location details
    let locationName = tokenResponse.locationId || "Unknown Location";
    if (tokenResponse.access_token && tokenResponse.locationId) {
      try {
        const locationInfo = await getLocationInfo(
          tokenResponse.access_token,
          tokenResponse.locationId
        );
        locationName = locationInfo.name || locationName;
        console.log("✅ Location info fetched:", locationName);
      } catch (error) {
        console.error("⚠️ Failed to fetch location info:", error);
      }
    }

    // Calculate token expiry timestamp
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenResponse.expires_in);

    // Save connection to Supabase
    const connectionRow: GHLConnectionRow = {
      session_id: state, // Use state (session_id) from OAuth flow
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token || null,
      token_expires_at: expiresAt.toISOString(),
      location_id: tokenResponse.locationId || null,
      location_name: locationName,
      company_id: tokenResponse.companyId || null,
      scopes: tokenResponse.scope ? tokenResponse.scope.split(" ") : [],
      is_active: true,
    };

    console.log("🔵 Saving connection to Supabase...");
    const { data: savedConnection, error: dbError } = await supabase
      .from("ghl_connections")
      .insert([connectionRow])
      .select()
      .single();

    if (dbError) {
      console.error("🔴 Failed to save connection:", dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log("✅ GHL connection saved successfully!", savedConnection.id);

    // Redirect back to app with success
    return NextResponse.redirect(
      new URL("/?ghl_connected=true", request.url)
    );
  } catch (error) {
    console.error("🔴 OAuth callback error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.redirect(
      new URL(`/?ghl_error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}
