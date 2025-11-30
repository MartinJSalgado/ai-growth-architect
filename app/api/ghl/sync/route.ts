import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { GHLMetricsCacheRow } from "@/lib/supabase";
import {
  getOpportunities,
  getContacts,
  getCampaigns,
  getAppointments,
  calculatePipelineMetrics,
  calculateEmailMetrics,
  calculateContactMetrics,
  refreshAccessToken,
} from "@/lib/gohighlevel";

export async function POST(request: NextRequest) {
  try {
    const { session_id } = await request.json();

    if (!session_id) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    console.log("🔵 Starting GHL metrics sync for session:", session_id);

    // Get active GHL connection for this session
    const { data: connection, error: connectionError } = await supabase
      .from("ghl_connections")
      .select("*")
      .eq("session_id", session_id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (connectionError || !connection) {
      console.error("🔴 No active GHL connection found");
      return NextResponse.json(
        { error: "GHL not connected" },
        { status: 404 }
      );
    }

    // Check if token needs refresh
    let accessToken = connection.access_token;
    if (connection.token_expires_at) {
      const expiryDate = new Date(connection.token_expires_at);
      const now = new Date();

      if (expiryDate <= now && connection.refresh_token) {
        console.log("🔵 Token expired, refreshing...");
        try {
          const newTokens = await refreshAccessToken(connection.refresh_token);

          // Update tokens in database
          const newExpiryDate = new Date();
          newExpiryDate.setSeconds(newExpiryDate.getSeconds() + newTokens.expires_in);

          await supabase
            .from("ghl_connections")
            .update({
              access_token: newTokens.access_token,
              refresh_token: newTokens.refresh_token || connection.refresh_token,
              token_expires_at: newExpiryDate.toISOString(),
            })
            .eq("id", connection.id);

          accessToken = newTokens.access_token;
          console.log("✅ Token refreshed successfully");
        } catch (error) {
          console.error("🔴 Failed to refresh token:", error);
          return NextResponse.json(
            { error: "Failed to refresh access token" },
            { status: 401 }
          );
        }
      }
    }

    const locationId = connection.location_id;
    if (!locationId) {
      return NextResponse.json(
        { error: "Location ID not found" },
        { status: 400 }
      );
    }

    const metricsToCache: GHLMetricsCacheRow[] = [];
    const cacheValidUntil = new Date();
    cacheValidUntil.setHours(cacheValidUntil.getHours() + 1); // Cache for 1 hour

    // Fetch Pipeline Data (Opportunities)
    console.log("🔵 Fetching opportunities...");
    try {
      const opportunities = await getOpportunities(accessToken, locationId);
      const pipelineMetrics = calculatePipelineMetrics(opportunities);

      metricsToCache.push({
        ghl_connection_id: connection.id,
        session_id: session_id,
        metric_type: "pipeline",
        metric_data: { opportunities, raw: opportunities },
        summary: pipelineMetrics,
        valid_until: cacheValidUntil.toISOString(),
      });

      console.log(`✅ Fetched ${opportunities.length} opportunities`);
    } catch (error) {
      console.error("⚠️ Failed to fetch opportunities:", error);
    }

    // Fetch Email Campaign Data
    console.log("🔵 Fetching campaigns...");
    try {
      const campaigns = await getCampaigns(accessToken, locationId);
      const emailMetrics = calculateEmailMetrics(campaigns);

      metricsToCache.push({
        ghl_connection_id: connection.id,
        session_id: session_id,
        metric_type: "email",
        metric_data: { campaigns, raw: campaigns },
        summary: emailMetrics,
        valid_until: cacheValidUntil.toISOString(),
      });

      console.log(`✅ Fetched ${campaigns.length} campaigns`);
    } catch (error) {
      console.error("⚠️ Failed to fetch campaigns:", error);
    }

    // Fetch Contact Data
    console.log("🔵 Fetching contacts...");
    try {
      const contacts = await getContacts(accessToken, locationId);
      const contactMetrics = calculateContactMetrics(contacts);

      metricsToCache.push({
        ghl_connection_id: connection.id,
        session_id: session_id,
        metric_type: "contacts",
        metric_data: { contacts: contacts.slice(0, 50), total: contacts.length }, // Limit stored data
        summary: contactMetrics,
        valid_until: cacheValidUntil.toISOString(),
      });

      console.log(`✅ Fetched ${contacts.length} contacts`);
    } catch (error) {
      console.error("⚠️ Failed to fetch contacts:", error);
    }

    // Fetch Appointment Data
    console.log("🔵 Fetching appointments...");
    try {
      const appointments = await getAppointments(accessToken, locationId);

      metricsToCache.push({
        ghl_connection_id: connection.id,
        session_id: session_id,
        metric_type: "appointments",
        metric_data: { appointments, total: appointments.length },
        summary: { totalAppointments: appointments.length },
        valid_until: cacheValidUntil.toISOString(),
      });

      console.log(`✅ Fetched ${appointments.length} appointments`);
    } catch (error) {
      console.error("⚠️ Failed to fetch appointments:", error);
    }

    // Save all metrics to cache
    if (metricsToCache.length > 0) {
      console.log(`🔵 Caching ${metricsToCache.length} metric types...`);

      const { error: cacheError } = await supabase
        .from("ghl_metrics_cache")
        .insert(metricsToCache);

      if (cacheError) {
        console.error("🔴 Failed to cache metrics:", cacheError);
      } else {
        console.log("✅ Metrics cached successfully");
      }

      // Update last_sync_at
      await supabase
        .from("ghl_connections")
        .update({ last_sync_at: new Date().toISOString() })
        .eq("id", connection.id);
    }

    return NextResponse.json({
      success: true,
      metrics_synced: metricsToCache.length,
      location_name: connection.location_name,
    });
  } catch (error) {
    console.error("🔴 Sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync GHL metrics" },
      { status: 500 }
    );
  }
}
