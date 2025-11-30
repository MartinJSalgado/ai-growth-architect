"use client";

import { useState, useEffect } from "react";
import { getOrCreateSessionId } from "@/lib/supabase";

interface GHLConnectionProps {
  onConnectionChange?: (connected: boolean) => void;
}

export default function GHLConnection({ onConnectionChange }: GHLConnectionProps) {
  const [connected, setConnected] = useState(false);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();

    // Check for OAuth callback success/error in URL
    const params = new URLSearchParams(window.location.search);
    const ghlConnected = params.get("ghl_connected");
    const ghlError = params.get("ghl_error");

    if (ghlConnected === "true") {
      setConnected(true);
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
      // Trigger initial sync
      handleSync();
    } else if (ghlError) {
      alert(`GHL Connection Error: ${ghlError}`);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const checkConnection = async () => {
    const sessionId = getOrCreateSessionId();

    try {
      const res = await fetch(`/api/ghl/metrics?session_id=${sessionId}`);
      const data = await res.json();

      if (data.connected) {
        setConnected(true);
        setLocationName(data.location_name);
        setLastSync(data.last_sync);
        onConnectionChange?.(true);
      } else {
        setConnected(false);
        onConnectionChange?.(false);
      }
    } catch (error) {
      console.error("Failed to check GHL connection:", error);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    const sessionId = getOrCreateSessionId();
    // Redirect to OAuth initiation endpoint
    window.location.href = `/api/ghl/connect?session_id=${sessionId}`;
  };

  const handleSync = async () => {
    setSyncing(true);
    const sessionId = getOrCreateSessionId();

    try {
      const res = await fetch("/api/ghl/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`Successfully synced ${data.metrics_synced} metric types from ${data.location_name}`);
        setLastSync(new Date().toISOString());
      } else {
        alert("Failed to sync metrics: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Sync error:", error);
      alert("Failed to sync GHL metrics");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-6 shadow-sm border-2 border-purple-100">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Connect GoHighLevel
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Connect your GoHighLevel account to get real-time insights on your pipeline, email campaigns, contacts, and appointments.
            </p>
            <button
              onClick={handleConnect}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Connect GoHighLevel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-green-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              Connected to GoHighLevel
            </h3>
            <p className="text-sm text-slate-500">
              {locationName || "Your GHL Account"}
            </p>
          </div>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white text-sm font-medium rounded-lg transition flex items-center gap-2"
        >
          <svg
            className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {syncing ? "Syncing..." : "Sync Now"}
        </button>
      </div>

      {lastSync && (
        <p className="text-xs text-slate-500">
          Last synced: {new Date(lastSync).toLocaleString()}
        </p>
      )}
    </div>
  );
}
