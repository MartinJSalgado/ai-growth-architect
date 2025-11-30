"use client";

import { useState } from "react";

interface OnboardingModalProps {
  onComplete: (data: {
    companyDescription: string;
    metrics: string;
    goals: string;
  }) => void;
  initialData?: {
    companyDescription: string;
    metrics: string;
    goals: string;
  };
}

export default function OnboardingModal({ onComplete, initialData }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [companyDescription, setCompanyDescription] = useState(initialData?.companyDescription || "");
  const [metrics, setMetrics] = useState(initialData?.metrics || "");
  const [goals, setGoals] = useState(initialData?.goals || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ companyDescription, metrics, goals });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-800">Welcome to AI Growth Architect</h2>
              <p className="text-sm text-slate-500">Let's set up your GTM intelligence system</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex gap-2 mb-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${
                  i <= step ? "bg-violet-600" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tell me about your company
                </label>
                <textarea
                  className="w-full rounded-xl border border-slate-300 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  rows={5}
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  placeholder="E.g., We're a B2B SaaS helping IT teams automate cloud deployments. Target customers are DevOps teams at mid-market companies ($50M-$500M revenue)."
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-medium transition"
              >
                Next: Add Metrics
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Current GTM Metrics
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Paste your current performance data: email metrics, funnel numbers, pipeline stats, etc.
                </p>
                <textarea
                  className="w-full rounded-xl border border-slate-300 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                  rows={8}
                  value={metrics}
                  onChange={(e) => setMetrics(e.target.value)}
                  placeholder={`Example:
Email Performance (Last 30 days):
- Sent: 5,000 emails
- Open rate: 18%
- Click rate: 2.3%
- Reply rate: 0.8%

Pipeline:
- MQLs: 45
- SQLs: 12
- Demos booked: 8
- Closed deals: 2`}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-xl font-medium transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-medium transition"
                >
                  Next: Set Goals
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  What are your growth goals?
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  What do you want to achieve in the next quarter?
                </p>
                <textarea
                  className="w-full rounded-xl border border-slate-300 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  rows={4}
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="E.g., Increase demo bookings by 30%, improve email open rates to 25%, generate 50 SQLs per month, reduce sales cycle from 45 to 30 days."
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-xl font-medium transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-medium transition"
                >
                  Start Using AI Growth Architect
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
