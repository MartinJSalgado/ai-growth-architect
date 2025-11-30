import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const session_id = searchParams.get("session_id");

  if (!session_id) {
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 }
    );
  }

  try {
    console.log("🔵 Fetching cached GHL metrics for session:", session_id);

    // Get active connection
    const { data: connection } = await supabase
      .from("ghl_connections")
      .select("*")
      .eq("session_id", session_id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!connection) {
      return NextResponse.json(
        { connected: false, error: "GHL not connected" },
        { status: 404 }
      );
    }

    // Fetch latest cached metrics using the view
    const { data: metrics, error: metricsError } = await supabase
      .from("latest_ghl_metrics")
      .select("*")
      .eq("ghl_connection_id", connection.id);

    if (metricsError) {
      console.error("🔴 Failed to fetch metrics:", metricsError);
      return NextResponse.json(
        { error: "Failed to fetch metrics" },
        { status: 500 }
      );
    }

    // Organize metrics by type
    const organizedMetrics: Record<string, any> = {
      pipeline: null,
      email: null,
      contacts: null,
      appointments: null,
      website: null,
    };

    metrics?.forEach((metric) => {
      organizedMetrics[metric.metric_type] = {
        summary: metric.summary,
        data: metric.metric_data,
        fetched_at: metric.fetched_at,
        valid_until: metric.valid_until,
      };
    });

    // Check if any metrics need refresh (expired)
    const now = new Date();
    const needsRefresh = metrics?.some(
      (m) => m.valid_until && new Date(m.valid_until) <= now
    );

    console.log("✅ Metrics fetched successfully", {
      types: metrics?.map((m) => m.metric_type),
      needsRefresh,
    });

    return NextResponse.json({
      connected: true,
      location_name: connection.location_name,
      last_sync: connection.last_sync_at,
      needs_refresh: needsRefresh || metrics?.length === 0,
      metrics: organizedMetrics,
    });
  } catch (error) {
    console.error("🔴 Error fetching metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch GHL metrics" },
      { status: 500 }
    );
  }
}
