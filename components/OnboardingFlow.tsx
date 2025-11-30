"use client";

import React, { useState, useEffect } from "react";

/* ---------- Types ---------- */

type Step = "chat" | "wizard" | "preview" | "boot" | "done";

type BrandPersonality =
  | "professional"
  | "bold"
  | "innovative"
  | "playful"
  | "friendly"
  | "technical";

type FabricStage =
  | "foundation"
  | "architecture"
  | "build"
  | "release"
  | "improve"
  | "compound";

type Channel = "email" | "linkedin" | "paidAds" | "seo" | "events" | "other";

type GrowthSection =
  | "icp"
  | "positioning"
  | "messaging"
  | "contentStrategy"
  | "campaignPlan"
  | "funnelMap"
  | "kpis"
  | "experimentRoadmap"
  | "automation";

export interface BusinessProfile {
  companyName: string;
  whatYouSell: string;
  whoYouSellTo: string;
  primaryGoal: string;
  channels: Channel[];
  biggestChallenge: string;
  history?: string;
}

export interface BrandSettings {
  personality: BrandPersonality[];
  fabricMaturity: Record<FabricStage, number>; // 1-5
  selectedSections: GrowthSection[];
  layoutPreference: "compact" | "detailed" | "visual";
}

export interface GeneratedPlan {
  summary: string;
  sections: Partial<Record<GrowthSection, string>>;
}

export interface OnboardingData {
  profile: BusinessProfile;
  brand: BrandSettings;
  plan: GeneratedPlan | null;
}

/* ---------- Helper Data ---------- */

const DEFAULT_PROFILE: BusinessProfile = {
  companyName: "",
  whatYouSell: "",
  whoYouSellTo: "",
  primaryGoal: "",
  channels: [],
  biggestChallenge: "",
  history: "",
};

const DEFAULT_BRAND: BrandSettings = {
  personality: ["innovative"],
  fabricMaturity: {
    foundation: 2,
    architecture: 2,
    build: 2,
    release: 2,
    improve: 1,
    compound: 1,
  },
  selectedSections: [
    "icp",
    "positioning",
    "messaging",
    "contentStrategy",
    "campaignPlan",
    "kpis",
  ],
  layoutPreference: "compact",
};

const FABRIC_LABELS: Record<FabricStage, string> = {
  foundation: "Foundation (ICP & Positioning)",
  architecture: "Architecture (Funnel & Offers)",
  build: "Build (Content & Assets)",
  release: "Release (Distribution)",
  improve: "Improve (Optimization)",
  compound: "Compound (Systems & Automation)",
};

const SECTION_LABELS: Record<GrowthSection, string> = {
  icp: "Ideal Customer Profile",
  positioning: "Positioning",
  messaging: "Messaging & Narrative",
  contentStrategy: "Content Strategy",
  campaignPlan: "Campaign Plan",
  funnelMap: "Funnel Map",
  kpis: "KPIs & Metrics",
  experimentRoadmap: "Experiment Roadmap",
  automation: "Automation Opportunities",
};

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

/* ---------- Main Component ---------- */

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState<Step>("chat");
  const [profile, setProfile] = useState<BusinessProfile>(DEFAULT_PROFILE);
  const [brand, setBrand] = useState<BrandSettings>(DEFAULT_BRAND);
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [bootProgress, setBootProgress] = useState<number>(0);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  /* ----- Boot sequence pseudo progress ----- */
  useEffect(() => {
    if (step !== "boot") return;
    setBootProgress(0);
    const checkpoints = [20, 50, 75, 100];
    let i = 0;

    const interval = setInterval(() => {
      setBootProgress(checkpoints[i]);
      i += 1;
      if (i >= checkpoints.length) {
        clearInterval(interval);
        setTimeout(() => setStep("done"), 600);
      }
    }, 700);

    return () => clearInterval(interval);
  }, [step]);

  /* ----- Handlers ----- */

  const toggleChannel = (ch: Channel) => {
    setProfile((prev) => {
      const exists = prev.channels.includes(ch);
      return {
        ...prev,
        channels: exists
          ? prev.channels.filter((c) => c !== ch)
          : [...prev.channels, ch],
      };
    });
  };

  const togglePersonality = (p: BrandPersonality) => {
    setBrand((prev) => {
      const exists = prev.personality.includes(p);
      return {
        ...prev,
        personality: exists
          ? prev.personality.filter((x) => x !== p)
          : [...prev.personality, p],
      };
    });
  };

  const toggleSection = (s: GrowthSection) => {
    setBrand((prev) => {
      const exists = prev.selectedSections.includes(s);
      return {
        ...prev,
        selectedSections: exists
          ? prev.selectedSections.filter((x) => x !== s)
          : [...prev.selectedSections, s],
      };
    });
  };

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);

    try {
      // Call AI backend to generate plan
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, brand }),
      });

      const data = await res.json();

      if (data.plan) {
        setPlan(data.plan);
      } else {
        // Fallback to mock if API fails
        const mockPlan = generateMockPlan();
        setPlan(mockPlan);
      }
    } catch (error) {
      console.error("Error generating plan:", error);
      // Use mock plan as fallback
      const mockPlan = generateMockPlan();
      setPlan(mockPlan);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const generateMockPlan = (): GeneratedPlan => {
    const mockSections: Partial<Record<GrowthSection, string>> = {};
    brand.selectedSections.forEach((section) => {
      mockSections[section] =
        `${SECTION_LABELS[section]} — Analysis and recommendations will be generated based on your company profile and goals.`;
    });

    return {
      summary: `This is a starter growth blueprint for ${profile.companyName || "your company"}, focused on ${
        profile.primaryGoal || "consistent pipeline growth"
      }. It uses a ${brand.layoutPreference} layout and emphasizes ${brand.personality.join(
        ", "
      )} brand tones.`,
      sections: mockSections,
    };
  };

  const handleComplete = () => {
    onComplete({ profile, brand, plan });
  };

  /* ---------- Step Renderers ---------- */

  const renderChatStep = () => (
    <div className="flex flex-col md:flex-row gap-8 h-full">
      {/* Left: "Chat" */}
      <div className="md:w-2/3 bg-white rounded-xl shadow p-6 flex flex-col overflow-hidden">
        <h2 className="text-xl font-semibold mb-2">
          Let's get to know your business
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Answer in your own words. We'll use this to personalize your growth system.
        </p>

        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          <LabeledTextarea
            label="What's your company name?"
            placeholder="Acme Corp"
            value={profile.companyName}
            onChange={(v) => setProfile({ ...profile, companyName: v })}
          />
          <LabeledTextarea
            label="What do you sell?"
            placeholder="We design and implement complete B2B growth systems..."
            value={profile.whatYouSell}
            onChange={(v) => setProfile({ ...profile, whatYouSell: v })}
          />
          <LabeledTextarea
            label="Who do you sell to?"
            placeholder="Mid-sized B2B tech companies..."
            value={profile.whoYouSellTo}
            onChange={(v) => setProfile({ ...profile, whoYouSellTo: v })}
          />
          <LabeledTextarea
            label="What's your #1 growth goal right now?"
            placeholder="Create a consistent flow of qualified opportunities..."
            value={profile.primaryGoal}
            onChange={(v) => setProfile({ ...profile, primaryGoal: v })}
          />
          <div>
            <p className="text-sm font-medium mb-1">
              Which channels are you actively using?
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["email", "Email"],
                  ["linkedin", "LinkedIn"],
                  ["paidAds", "Paid ads"],
                  ["seo", "SEO"],
                  ["events", "Events"],
                  ["other", "Other"],
                ] as [Channel, string][]
              ).map(([value, label]) => {
                const active = profile.channels.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleChannel(value)}
                    className={`px-3 py-1 rounded-full text-xs border transition ${
                      active
                        ? "bg-violet-600 text-white border-violet-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-violet-300"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <LabeledTextarea
            label="What's the biggest challenge in your way?"
            placeholder="We're stuck on random tactics and don't have a clear system..."
            value={profile.biggestChallenge}
            onChange={(v) => setProfile({ ...profile, biggestChallenge: v })}
          />
          <LabeledTextarea
            label="Anything else about your history or context?"
            placeholder="We started in 2020, have worked with X types of clients..."
            value={profile.history ?? ""}
            onChange={(v) => setProfile({ ...profile, history: v })}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            onClick={() => setStep("wizard")}
          >
            Skip & Continue
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg text-sm bg-violet-600 text-white font-medium hover:bg-violet-500 transition"
            onClick={() => setStep("wizard")}
          >
            End chat & continue
          </button>
        </div>
      </div>

      {/* Right: Profile Summary */}
      <div className="md:w-1/3 bg-slate-900 text-slate-50 rounded-xl shadow p-6 flex flex-col">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-400 mb-2">
          Company Profile
        </h3>
        <h2 className="text-xl font-semibold mb-4">
          {profile.companyName || "Your company"}
        </h2>

        <div className="space-y-3 text-sm text-slate-200">
          <ProfileRow
            label="What you sell"
            value={profile.whatYouSell || "Describe your core offer."}
          />
          <ProfileRow
            label="Who you sell to"
            value={profile.whoYouSellTo || "Add your ideal customers."}
          />
          <ProfileRow
            label="Primary goal"
            value={profile.primaryGoal || "What outcome are you chasing?"}
          />
          <ProfileRow
            label="Biggest challenge"
            value={
              profile.biggestChallenge ||
              "Share what's getting in the way right now."
            }
          />
          <ProfileRow
            label="Channels"
            value={
              profile.channels.length > 0
                ? profile.channels.join(", ")
                : "Select your active channels."
            }
          />
        </div>
      </div>
    </div>
  );

  const renderWizardStep = () => (
    <div className="flex flex-col md:flex-row gap-8 h-full">
      {/* Left: Setup wizard */}
      <div className="md:w-2/3 bg-white rounded-xl shadow p-6 flex flex-col overflow-hidden">
        <h2 className="text-xl font-semibold mb-2">
          Shape your brand & growth blueprint
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          This helps the Growth Architect design a plan that feels like you — not a generic template.
        </p>

        <div className="space-y-6 overflow-y-auto pr-1 flex-1">
          {/* Personality */}
          <div>
            <p className="text-sm font-medium mb-1">Brand personality</p>
            <p className="text-xs text-gray-500 mb-2">
              Choose all that apply.
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["professional", "Professional"],
                  ["bold", "Bold"],
                  ["innovative", "Innovative"],
                  ["playful", "Playful"],
                  ["friendly", "Friendly"],
                  ["technical", "Technical"],
                ] as [BrandPersonality, string][]
              ).map(([value, label]) => {
                const active = brand.personality.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => togglePersonality(value)}
                    className={`px-3 py-1 rounded-full text-xs border transition ${
                      active
                        ? "bg-sky-600 text-white border-sky-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-sky-300"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FABRIC maturity */}
          <div>
            <p className="text-sm font-medium mb-1">
              Where are you today in your growth system?
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Rate each layer from 1 (barely defined) to 5 (dialed in).
            </p>
            <div className="space-y-3">
              {(Object.keys(FABRIC_LABELS) as FabricStage[]).map((stage) => (
                <div key={stage}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">
                      {FABRIC_LABELS[stage]}
                    </span>
                    <span className="text-gray-400">
                      {brand.fabricMaturity[stage]}/5
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={brand.fabricMaturity[stage]}
                    onChange={(e) =>
                      setBrand((prev) => ({
                        ...prev,
                        fabricMaturity: {
                          ...prev.fabricMaturity,
                          [stage]: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full accent-violet-600"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div>
            <p className="text-sm font-medium mb-1">
              What should your initial growth plan include?
            </p>
            <p className="text-xs text-gray-500 mb-3">
              You can add or remove sections later.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(Object.keys(SECTION_LABELS) as GrowthSection[]).map(
                (section) => {
                  const active = brand.selectedSections.includes(section);
                  return (
                    <button
                      type="button"
                      key={section}
                      onClick={() => toggleSection(section)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs transition ${
                        active
                          ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                          : "bg-white border-gray-200 text-gray-700 hover:border-emerald-300"
                      }`}
                    >
                      <span>{SECTION_LABELS[section]}</span>
                      {active && (
                        <span className="text-[10px] ml-2">✓</span>
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Layout preference */}
          <div>
            <p className="text-sm font-medium mb-1">
              How do you like to see your strategy?
            </p>
            <div className="flex gap-3 mt-2">
              {(
                [
                  ["compact", "Compact summary"],
                  ["detailed", "Detailed brief"],
                  ["visual", "Visual / map-style"],
                ] as [BrandSettings["layoutPreference"], string][]
              ).map(([value, label]) => {
                const active = brand.layoutPreference === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setBrand((prev) => ({ ...prev, layoutPreference: value }))
                    }
                    className={`flex-1 px-3 py-2 rounded-lg border text-xs text-left transition ${
                      active
                        ? "bg-violet-50 border-violet-500 text-violet-900"
                        : "bg-white border-gray-200 text-gray-700 hover:border-violet-300"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <button
            type="button"
            className="px-3 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            onClick={() => setStep("chat")}
          >
            Back
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              onClick={() => {
                handleGeneratePlan();
                setStep("preview");
              }}
            >
              Skip preview
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg text-sm bg-violet-600 text-white font-medium hover:bg-violet-500 transition"
              onClick={() => {
                handleGeneratePlan();
                setStep("preview");
              }}
            >
              Continue to preview
            </button>
          </div>
        </div>
      </div>

      {/* Right: Mini live summary */}
      <div className="md:w-1/3 bg-slate-900 text-slate-50 rounded-xl shadow p-6 flex flex-col">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-400 mb-3">
          Blueprint Snapshot
        </h3>
        <p className="text-xs text-slate-300 mb-2">
          Personality:{" "}
          <span className="font-medium">
            {brand.personality.length
              ? brand.personality.join(", ")
              : "Not set yet"}
          </span>
        </p>
        <p className="text-xs text-slate-300 mb-2">
          Layout:{" "}
          <span className="font-medium capitalize">
            {brand.layoutPreference}
          </span>
        </p>
        <p className="text-xs text-slate-300 mb-2">
          Sections:{" "}
          <span className="font-medium">
            {brand.selectedSections.length} selected
          </span>
        </p>
        <div className="mt-3 text-[11px] text-slate-400">
          We'll use this to generate your first Growth Plan in the next step.
        </div>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="flex flex-col md:flex-row gap-8 h-full">
      {/* Left: Plan preview */}
      <div className="md:w-2/3 bg-white rounded-xl shadow p-6 flex flex-col overflow-hidden">
        <h2 className="text-xl font-semibold mb-2">Preview your Growth Plan</h2>
        <p className="text-sm text-gray-500 mb-4">
          This is a starting point generated from your answers. You can refine it later inside the dashboard.
        </p>

        <div className="flex-1 overflow-y-auto pr-1 border rounded-lg p-4">
          {isGeneratingPlan && !plan && (
            <p className="text-sm text-gray-500">
              Generating your plan with AI…
            </p>
          )}

          {plan && (
            <div className="space-y-5 text-sm">
              <section>
                <h3 className="text-base font-semibold mb-1">Summary</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {plan.summary}
                </p>
              </section>

              {brand.selectedSections.map((section) => (
                <section key={section}>
                  <h3 className="text-base font-semibold mb-1">
                    {SECTION_LABELS[section]}
                  </h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {plan.sections[section] ??
                      "This section will be expanded inside the dashboard."}
                  </p>
                </section>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <button
            type="button"
            className="px-3 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            onClick={() => setStep("wizard")}
          >
            Back
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              onClick={handleGeneratePlan}
              disabled={isGeneratingPlan}
            >
              {isGeneratingPlan ? "Regenerating…" : "Regenerate"}
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg text-sm bg-violet-600 text-white font-medium hover:bg-violet-500 transition"
              onClick={() => setStep("boot")}
            >
              Looks good → Build my dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="md:w-1/3 bg-slate-900 text-slate-50 rounded-xl shadow p-6 flex flex-col">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-400 mb-3">
          Plan controls
        </h3>
        <p className="text-xs text-slate-300 mb-2">
          Layout:{" "}
          <span className="font-medium capitalize">
            {brand.layoutPreference}
          </span>
        </p>
        <p className="text-xs text-slate-300 mb-3">
          Personality:{" "}
          <span className="font-medium">
            {brand.personality.join(", ") || "Not set"}
          </span>
        </p>
        <p className="text-[11px] text-slate-400 mb-3">
          You can change these in the previous step and regenerate if the tone doesn't feel right.
        </p>
        <button
          type="button"
          className="mt-auto px-3 py-2 rounded-lg text-xs border border-slate-500 text-slate-100 hover:bg-slate-800 transition"
          onClick={() => setStep("wizard")}
        >
          Adjust inputs & regenerate
        </button>
      </div>
    </div>
  );

  const renderBootStep = () => (
    <div className="h-full flex items-center justify-center">
      <div className="bg-slate-900 text-slate-50 rounded-2xl shadow-xl p-8 max-w-xl w-full">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">
          AI Growth Architect
        </p>
        <h2 className="text-2xl font-semibold mb-4">
          Building your growth system…
        </h2>
        <p className="text-sm text-slate-300 mb-6">
          We're turning your answers into a working Growth Blueprint and personalized dashboard.
        </p>

        <ol className="space-y-3 text-sm mb-6">
          {[
            "Preparing your GTM profile",
            "Structuring your FABRIC snapshot",
            "Generating your starter Growth Plan",
            "Configuring quick actions & recommendations",
            "Assembling your dashboard",
          ].map((item, idx) => {
            const threshold = (idx + 1) * 20;
            const done = bootProgress >= threshold;
            return (
              <li key={item} className="flex items-start gap-2">
                <span
                  className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center text-[10px] transition ${
                    done
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-slate-500 text-slate-400"
                  }`}
                >
                  {done ? "✓" : idx + 1}
                </span>
                <span
                  className={done ? "text-slate-100" : "text-slate-400"}
                >
                  {item}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 bg-emerald-500 transition-all duration-300"
            style={{ width: `${bootProgress}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          This usually takes just a moment. No need to refresh.
        </p>
      </div>
    </div>
  );

  const renderDoneStep = () => (
    <div className="h-full flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xl w-full">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">
          Setup complete
        </p>
        <h2 className="text-2xl font-semibold mb-3">
          Your Growth System is ready, {profile.companyName || "Founder"}.
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          We've created a starter Growth Plan, configured your FABRIC snapshot, and set up a personalized dashboard inside AI Growth Architect.
        </p>
        <div className="space-y-2 text-sm text-gray-700 mb-6">
          <p>Next steps you can take:</p>
          <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
            <li>Review and tweak your Growth Plan.</li>
            <li>Pin your top KPIs to the dashboard.</li>
            <li>Launch your first experiment or campaign.</li>
          </ul>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            onClick={() => setStep("preview")}
          >
            View generated plan
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg text-sm bg-violet-600 text-white font-medium hover:bg-violet-500 transition"
            onClick={handleComplete}
          >
            Go to my dashboard
          </button>
        </div>
      </div>
    </div>
  );

  /* ---------- Main Layout ---------- */

  return (
    <div className="fixed inset-0 bg-slate-100 flex items-center justify-center px-4 py-8 z-50">
      <div className="w-full max-w-6xl h-[650px] bg-slate-50 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 border-b bg-white">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-slate-900 flex items-center justify-center text-xs text-white font-semibold">
              GA
            </div>
            <div>
              <p className="text-sm font-semibold">AI Growth Architect</p>
              <p className="text-[11px] text-gray-500">
                Guided onboarding · Powered by your answers
              </p>
            </div>
          </div>
          <StepIndicator step={step} />
        </header>

        {/* Body */}
        <main className="flex-1 p-6 overflow-hidden">
          {step === "chat" && renderChatStep()}
          {step === "wizard" && renderWizardStep()}
          {step === "preview" && renderPreviewStep()}
          {step === "boot" && renderBootStep()}
          {step === "done" && renderDoneStep()}
        </main>
      </div>
    </div>
  );
};

/* ---------- Small Reusable Components ---------- */

const LabeledTextarea: React.FC<{
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}> = ({ label, value, placeholder, onChange }) => (
  <label className="block text-sm">
    <span className="font-medium text-gray-700">{label}</span>
    <textarea
      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
      rows={2}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  </label>
);

const ProfileRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div>
    <p className="text-[11px] uppercase tracking-wide text-slate-400">
      {label}
    </p>
    <p className="text-xs text-slate-100">{value}</p>
  </div>
);

const StepIndicator: React.FC<{ step: Step }> = ({ step }) => {
  const steps: { id: Step; label: string }[] = [
    { id: "chat", label: "Chat" },
    { id: "wizard", label: "Setup" },
    { id: "preview", label: "Preview" },
    { id: "boot", label: "Build" },
    { id: "done", label: "Ready" },
  ];

  const currentIdx = steps.findIndex((s) => s.id === step);

  return (
    <div className="flex items-center gap-2 text-xs">
      {steps.map((s, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={s.id} className="flex items-center gap-1">
            <div
              className={`h-6 px-2 rounded-full flex items-center justify-center border text-[11px] transition ${
                active
                  ? "bg-violet-600 text-white border-violet-600"
                  : done
                  ? "bg-emerald-50 text-emerald-700 border-emerald-500"
                  : "bg-white text-gray-500 border-gray-300"
              }`}
            >
              {s.label}
            </div>
            {idx < steps.length - 1 && (
              <div className="w-6 h-px bg-gray-300" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OnboardingFlow;
