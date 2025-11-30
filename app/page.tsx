"use client";

import { useState, useEffect } from "react";
import ChatWindow from "@/components/ChatWindow";
import ChatInput from "@/components/ChatInput";
import QuickActions from "@/components/QuickActions";
import AIInsights from "@/components/AIInsights";
import GHLConnection from "@/components/GHLConnection";
import GHLMetricsDashboard from "@/components/GHLMetricsDashboard";
import OnboardingFlow, { OnboardingData } from "@/components/OnboardingFlow";
import { supabase, getOrCreateSessionId, type OnboardingDataRow, type GrowthPlanRow, type AnalyticsEventRow } from "@/lib/supabase";

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [onboardingId, setOnboardingId] = useState<string | null>(null);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hi! I'm your AI Growth Architect. I've analyzed your GTM data and identified 3 key opportunities to accelerate growth. What would you like to focus on today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ghlMetrics, setGhlMetrics] = useState<any>(null);

  // Load onboarding data and GHL metrics on mount
  useEffect(() => {
    loadOnboardingData();
    loadGHLMetrics();
  }, []);

  const loadOnboardingData = async () => {
    const sessionId = getOrCreateSessionId();

    try {
      // Try to load from Supabase first
      const { data, error } = await supabase
        .from("onboarding_data")
        .select("*")
        .eq("session_id", sessionId)
        .eq("completed", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        // Convert Supabase data to OnboardingData format
        const onboardingData: OnboardingData = {
          profile: {
            companyName: data.company_name,
            whatYouSell: data.what_you_sell,
            whoYouSellTo: data.who_you_sell_to,
            primaryGoal: data.primary_goal,
            channels: data.channels as any[],
            biggestChallenge: data.biggest_challenge,
            history: data.history || undefined,
          },
          brand: {
            personality: data.brand_personality as any[],
            fabricMaturity: data.fabric_maturity as any,
            selectedSections: data.selected_sections as any[],
            layoutPreference: data.layout_preference as any,
          },
          plan: null, // Will load separately if needed
        };

        setOnboardingData(onboardingData);
        setOnboardingId(data.id);
        return;
      }
    } catch (error) {
      console.error("Error loading from Supabase:", error);
    }

    // Fallback to localStorage
    const stored = localStorage.getItem("onboardingData");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setOnboardingData(data);
      } catch (e) {
        console.error("Error parsing localStorage data:", e);
        setShowOnboarding(true);
      }
    } else {
      setShowOnboarding(true);
    }
  };

  const loadGHLMetrics = async () => {
    const sessionId = getOrCreateSessionId();

    try {
      const res = await fetch(`/api/crm/metrics?session_id=${sessionId}`);
      const data = await res.json();

      if (data.connected && data.metrics) {
        setGhlMetrics(data.metrics);
        console.log("✅ CRM metrics loaded:", data.metrics);
      }
    } catch (error) {
      console.error("Failed to load CRM metrics:", error);
    }
  };

  const handleOnboardingComplete = async (data: OnboardingData) => {
    const sessionId = getOrCreateSessionId();

    // Save to localStorage immediately
    localStorage.setItem("onboardingData", JSON.stringify(data));
    setOnboardingData(data);
    setShowOnboarding(false);

    // Save to Supabase in background
    console.log("🔵 Starting Supabase save...", { sessionId });
    try {
      // Save onboarding data
      const onboardingRow: OnboardingDataRow = {
        session_id: sessionId,
        company_name: data.profile.companyName,
        what_you_sell: data.profile.whatYouSell,
        who_you_sell_to: data.profile.whoYouSellTo,
        primary_goal: data.profile.primaryGoal,
        channels: data.profile.channels,
        biggest_challenge: data.profile.biggestChallenge,
        history: data.profile.history || null,
        brand_personality: data.brand.personality,
        fabric_maturity: data.brand.fabricMaturity,
        selected_sections: data.brand.selectedSections,
        layout_preference: data.brand.layoutPreference,
        completed: true,
      };

      console.log("🔵 Attempting to insert:", onboardingRow);

      const { data: savedOnboarding, error: onboardingError } = await supabase
        .from("onboarding_data")
        .insert([onboardingRow])
        .select()
        .single();

      if (onboardingError) {
        console.error("🔴 Error saving onboarding to Supabase:", onboardingError);
        console.error("🔴 Error details:", JSON.stringify(onboardingError, null, 2));
      } else if (savedOnboarding) {
        console.log("✅ Successfully saved to Supabase!", savedOnboarding);
        setOnboardingId(savedOnboarding.id);

        // Save growth plan if exists
        if (data.plan) {
          const planRow: GrowthPlanRow = {
            onboarding_id: savedOnboarding.id,
            session_id: sessionId,
            summary: data.plan.summary,
            sections: data.plan.sections as any,
          };

          const { error: planError } = await supabase
            .from("growth_plans")
            .insert([planRow]);

          if (planError) {
            console.error("Error saving plan to Supabase:", planError);
          }
        }

        // Track onboarding completion event
        trackEvent("onboarding_completed", {
          company_name: data.profile.companyName,
          primary_goal: data.profile.primaryGoal,
          channels: data.profile.channels,
        });
      }
    } catch (error) {
      console.error("Error saving to Supabase:", error);
    }

    // Send initial welcome message
    const welcomeMessage = `Welcome to AI Growth Architect, ${data.profile.companyName}! I've reviewed your profile and growth plan. I'm here to help you execute on your ${data.profile.primaryGoal}. What would you like to work on first?`;

    setMessages([
      {
        sender: "ai",
        text: welcomeMessage,
      },
    ]);
  };

  const trackEvent = async (eventType: string, eventData?: Record<string, any>) => {
    const sessionId = getOrCreateSessionId();

    try {
      const event: AnalyticsEventRow = {
        session_id: sessionId,
        onboarding_id: onboardingId || undefined,
        event_type: eventType,
        event_data: eventData,
      };

      console.log("🔵 Tracking event:", eventType, eventData);
      const { error } = await supabase.from("analytics_events").insert([event]);

      if (error) {
        console.error("🔴 Error tracking event:", error);
      } else {
        console.log("✅ Event tracked successfully:", eventType);
      }
    } catch (error) {
      console.error("🔴 Error tracking event:", error);
    }
  };

  const sendMessage = async (messageText: string, isAutomatic = false) => {
    if (!isAutomatic) {
      const userMessage = { sender: "user", text: messageText };
      setMessages((prev) => [...prev, userMessage]);
    }

    setLoading(true);

    try {
      const res = await fetch("/api/growth-architect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyDescription: onboardingData?.profile.whatYouSell || "",
          goal: onboardingData?.profile.primaryGoal || "",
          metrics: formatMetricsForAPI(onboardingData),
          userMessage: messageText,
        }),
      });

      const data = await res.json();

      const aiMessage = { sender: "ai", text: data.answer || data.error || "No response" };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = { sender: "ai", text: "Error: Failed to connect to the API" };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatMetricsForAPI = (data: OnboardingData | null): string => {
    if (!data) return "";

    const { profile, brand } = data;

    let metricsText = `
Company: ${profile.companyName}
Target Market: ${profile.whoYouSellTo}
Channels: ${profile.channels.join(", ")}
Biggest Challenge: ${profile.biggestChallenge}

FABRIC Maturity:
${Object.entries(brand.fabricMaturity).map(([stage, level]) => `- ${stage}: ${level}/5`).join("\n")}

Brand Personality: ${brand.personality.join(", ")}`;

    // Add GoHighLevel metrics if available
    if (ghlMetrics) {
      metricsText += "\n\nGOHIGHLEVEL REAL-TIME METRICS:";

      if (ghlMetrics.pipeline?.summary) {
        const p = ghlMetrics.pipeline.summary;
        metricsText += `\n\nPipeline Data:
- Total Opportunities: ${p.totalOpportunities || 0}
- Total Pipeline Value: $${(p.totalValue || 0).toLocaleString()}
- Average Deal Size: $${Math.round(p.avgValue || 0).toLocaleString()}`;
      }

      if (ghlMetrics.email?.summary) {
        const e = ghlMetrics.email.summary;
        metricsText += `\n\nEmail Campaign Performance:
- Total Campaigns: ${e.totalCampaigns || 0}
- Emails Sent: ${(e.totalSent || 0).toLocaleString()}
- Average Open Rate: ${e.avgOpenRate || 0}%
- Average Click Rate: ${e.avgClickRate || 0}%`;
      }

      if (ghlMetrics.contacts?.summary) {
        const c = ghlMetrics.contacts.summary;
        metricsText += `\n\nContact Database:
- Total Contacts: ${(c.totalContacts || 0).toLocaleString()}
- New Contacts (Last 30 Days): ${(c.recentContacts || 0).toLocaleString()}`;
      }

      if (ghlMetrics.appointments?.summary) {
        const a = ghlMetrics.appointments.summary;
        metricsText += `\n\nAppointments:
- Total Appointments: ${(a.totalAppointments || 0).toLocaleString()}`;
      }
    }

    return metricsText.trim();
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!input.trim()) return;

    sendMessage(input);
    setInput("");
  };

  const handleQuickAction = (action: string) => {
    trackEvent("quick_action_clicked", { action });

    let prompt = "";
    switch (action) {
      case "Generate Campaign Plan":
        prompt = "Create a detailed campaign plan for my company based on my current profile and goals.";
        break;
      case "Get Growth Ideas":
        prompt = "Give me 5 high-impact growth ideas I can implement in the next 30 days.";
        break;
      case "Content Suggestions":
        prompt = "Suggest content topics and formats that would resonate with my target audience.";
        break;
    }
    sendMessage(prompt);
  };

  const handleInsightAction = (insight: string) => {
    trackEvent("insight_clicked", { insight });

    let prompt = "";
    switch (insight) {
      case "Untapped Market Segment":
        prompt = "Help me create a strategy to target the untapped market segment you identified.";
        break;
      case "Email Send Time Optimization":
        prompt = "Give me a detailed plan to optimize my email send times and improve open rates.";
        break;
      case "Content Gap Analysis":
        prompt = "What specific content should I create to fill the gaps you identified?";
        break;
    }
    sendMessage(prompt);
  };

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <main className="min-h-screen p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800 mb-2">
            AI Growth Architect
          </h1>
          <p className="text-slate-500">
            Get intelligent recommendations and strategic guidance for your GTM initiatives.
          </p>
        </div>

        {onboardingData && (
          <button
            onClick={() => {
              trackEvent("edit_company_info_clicked");
              setShowOnboarding(true);
            }}
            className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Edit Company Info
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2">
          <ChatWindow messages={messages} />
          <ChatInput
            value={input}
            setValue={setInput}
            onSubmit={handleSubmit}
            disabled={loading}
          />
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <GHLConnection />
          <GHLMetricsDashboard />
          <QuickActions onActionClick={handleQuickAction} />
          <AIInsights onInsightClick={handleInsightAction} />
        </div>
      </div>
    </main>
  );
}
