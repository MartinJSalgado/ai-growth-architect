"use client";

import { useState, useEffect } from "react";
import ChatWindow from "@/components/ChatWindow";
import ChatInput from "@/components/ChatInput";
import QuickActions from "@/components/QuickActions";
import AIInsights from "@/components/AIInsights";
import OnboardingFlow, { OnboardingData, BusinessProfile, BrandSettings } from "@/components/OnboardingFlow";

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hi! I'm your AI Growth Architect. I've analyzed your GTM data and identified 3 key opportunities to accelerate growth. What would you like to focus on today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Load onboarding data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("onboardingData");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setOnboardingData(data);
      } catch (e) {
        console.error("Error parsing onboarding data:", e);
        setShowOnboarding(true);
      }
    } else {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = (data: OnboardingData) => {
    setOnboardingData(data);
    localStorage.setItem("onboardingData", JSON.stringify(data));
    setShowOnboarding(false);

    // Send initial welcome message with company context
    const welcomeMessage = `Welcome to AI Growth Architect, ${data.profile.companyName}! I've reviewed your profile and growth plan. I'm here to help you execute on your ${data.profile.primaryGoal}. What would you like to work on first?`;

    setMessages([
      {
        sender: "ai",
        text: welcomeMessage,
      },
    ]);
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

    return `
Company: ${profile.companyName}
Target Market: ${profile.whoYouSellTo}
Channels: ${profile.channels.join(", ")}
Biggest Challenge: ${profile.biggestChallenge}

FABRIC Maturity:
${Object.entries(brand.fabricMaturity).map(([stage, level]) => `- ${stage}: ${level}/5`).join("\n")}

Brand Personality: ${brand.personality.join(", ")}
    `.trim();
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!input.trim()) return;

    sendMessage(input);
    setInput("");
  };

  const handleQuickAction = (action: string) => {
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
            onClick={() => setShowOnboarding(true)}
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
          <QuickActions onActionClick={handleQuickAction} />
          <AIInsights onInsightClick={handleInsightAction} />
        </div>
      </div>
    </main>
  );
}
