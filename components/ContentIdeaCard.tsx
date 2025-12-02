"use client";

import { useState } from 'react';

export interface ContentIdea {
  title: string;
  format: string;
  rationale: string;
  angle: string;
  targetAudience: string;
  buyerStage: string;
  structuredConcept: {
    summary: string;
    coreArgument: string;
    outline: string[];
    hooks: string[];
    suggestedCta: string;
  };
  expectedImpact: {
    leadGenPotential: string;
    reasoning: string;
  };
}

interface ContentIdeaCardProps {
  idea: ContentIdea;
  index: number;
}

export function ContentIdeaCard({ idea, index }: ContentIdeaCardProps) {
  const [creating, setCreating] = useState(false);

  const handleOpenInContentOS = async () => {
    setCreating(true);

    try {
      const response = await fetch('/api/content/create-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: idea.title,
          format: idea.format,
          rationale: idea.rationale,
          angle: idea.angle,
          targetAudience: idea.targetAudience,
          buyerStage: idea.buyerStage,
          structuredConcept: idea.structuredConcept,
          expectedImpact: idea.expectedImpact,
          source: 'architect',
        }),
      });

      const data = await response.json();

      if (data.ideaId) {
        // Redirect to Content OS with the new idea
        window.location.href = `/content?idea=${data.ideaId}&action=open`;
      } else {
        alert(data.error || 'Failed to create idea');
      }
    } catch (error) {
      console.error('Failed to create idea:', error);
      alert('Failed to create idea. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const formatBadgeColor = (format: string) => {
    const colors: Record<string, string> = {
      podcast: 'bg-purple-100 text-purple-700',
      video: 'bg-blue-100 text-blue-700',
      linkedin: 'bg-cyan-100 text-cyan-700',
      newsletter: 'bg-orange-100 text-orange-700',
      blog: 'bg-green-100 text-green-700',
    };
    return colors[format.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const impactColor = (potential: string) => {
    if (potential === 'High') return 'text-green-700';
    if (potential === 'Medium') return 'text-yellow-700';
    return 'text-slate-600';
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-5 mb-3 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Number Badge */}
        <div className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0 text-sm">
          {index}
        </div>

        <div className="flex-1">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h4 className="text-slate-900 font-semibold text-lg leading-tight">
              {idea.title}
            </h4>
            <span className={`px-2 py-1 rounded text-xs font-medium capitalize flex-shrink-0 ${formatBadgeColor(idea.format)}`}>
              {idea.format}
            </span>
          </div>

          {/* Rationale */}
          <p className="text-slate-700 text-sm mb-3 leading-relaxed">
            {idea.rationale}
          </p>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600 mb-3 border-t border-slate-200 pt-3">
            <div>
              <span className="font-medium text-slate-700">Target:</span>{' '}
              {idea.targetAudience}
            </div>
            <div>
              <span className="font-medium text-slate-700">Angle:</span>{' '}
              {idea.angle}
            </div>
            <div>
              <span className="font-medium text-slate-700">Stage:</span>{' '}
              {idea.buyerStage}
            </div>
            <div className={impactColor(idea.expectedImpact.leadGenPotential)}>
              <span className="font-medium">Lead Gen:</span>{' '}
              {idea.expectedImpact.leadGenPotential}
            </div>
          </div>

          {/* Impact Reasoning (Collapsible Preview) */}
          {idea.expectedImpact.reasoning && (
            <div className="bg-white/60 rounded p-3 mb-3 text-xs text-slate-600 border border-slate-200">
              <span className="font-medium text-slate-700">Why this works: </span>
              {idea.expectedImpact.reasoning}
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleOpenInContentOS}
            disabled={creating}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {creating ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating idea...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Open in Content OS
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
