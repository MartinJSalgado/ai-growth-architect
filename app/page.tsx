"use client";

import { useState } from "react";

export default function Home() {
  const [companyDescription, setCompanyDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [metrics, setMetrics] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch("/api/growth-architect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyDescription, goal, metrics }),
      });

      const data = await res.json();
      setAnswer(data.answer || data.error || "No response");
    } catch (error) {
      setAnswer("Error: Failed to connect to the API");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-semibold">AI Growth Architect</h1>
            <p className="text-sm text-slate-400">Your intelligent GTM strategy partner</p>
          </div>
        </div>

        <p className="text-slate-300 mb-6">
          Get intelligent recommendations and strategic guidance for your GTM initiatives.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm mb-1 text-slate-200">
              Company / Product Description
            </label>
            <textarea
              className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              rows={3}
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              placeholder="Who do you sell to? What do you sell?"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-200">
              Goal for this session
            </label>
            <input
              className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Improve Q2 email performance, plan a Q3 pipeline sprint..."
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-200">
              Metrics / Exported Data (paste here)
            </label>
            <textarea
              className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              rows={8}
              value={metrics}
              onChange={(e) => setMetrics(e.target.value)}
              placeholder="Paste email metrics, ad performance, funnel numbers, etc."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl bg-violet-500 px-6 py-3 text-sm font-medium hover:bg-violet-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Thinking...
              </>
            ) : (
              "Generate Growth Strategy"
            )}
          </button>
        </form>

        {answer && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 max-h-[500px] overflow-y-auto">
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-slate-200">{answer}</div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
