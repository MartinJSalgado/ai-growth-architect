"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase, getOrCreateSessionId } from '@/lib/supabase';

export default function ContentPage() {
  const searchParams = useSearchParams();
  const ideaId = searchParams.get('idea');
  const action = searchParams.get('action');
  const [idea, setIdea] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ideaId) {
      loadIdea();
    } else {
      setLoading(false);
    }
  }, [ideaId]);

  const loadIdea = async () => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', ideaId)
        .single();

      if (data) {
        setIdea(data);
      } else {
        console.error('Idea not found:', error);
      }
    } catch (error) {
      console.error('Error loading idea:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Content OS</h1>
              <p className="text-slate-600 mt-1">Powered by AI Growth Architect</p>
            </div>
            <a
              href="/"
              className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-600 mt-4">Loading...</p>
          </div>
        ) : idea ? (
          // Show the idea that was created
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Idea Created Successfully
              </div>
              <h2 className="text-3xl font-semibold text-slate-900 mb-3">{idea.title}</h2>
              <div className="flex items-center gap-3 text-sm text-slate-600 mb-6">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded capitalize font-medium">
                  {idea.format}
                </span>
                <span>•</span>
                <span>Source: AI Architect</span>
                <span>•</span>
                <span>Status: Ready to develop</span>
              </div>
            </div>

            {idea.structured_concept && (
              <div className="space-y-6">
                {/* Core Argument */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Core Argument</h3>
                  <p className="text-slate-700 leading-relaxed">
                    {idea.structured_concept.coreArgument}
                  </p>
                </div>

                {/* Outline */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Outline</h3>
                  <ol className="space-y-2">
                    {idea.structured_concept.outline.map((point: string, index: number) => (
                      <li key={index} className="flex gap-3">
                        <span className="text-purple-600 font-semibold flex-shrink-0">{index + 1}.</span>
                        <span className="text-slate-700">{point}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Hooks */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Hook Options</h3>
                  <div className="space-y-2">
                    {idea.structured_concept.hooks.map((hook: string, index: number) => (
                      <div key={index} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-slate-700">{hook}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggested CTA */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Suggested CTA</h3>
                  <p className="text-slate-700">{idea.structured_concept.suggestedCta}</p>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">What's Next?</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-blue-900 mb-4">
                  <strong>Content OS workspace is coming soon!</strong>
                </p>
                <p className="text-blue-800 text-sm leading-relaxed mb-4">
                  The full Content OS interface will allow you to:
                </p>
                <ul className="text-blue-800 text-sm space-y-2 mb-4 list-disc list-inside">
                  <li>View all your content ideas and episodes</li>
                  <li>Progress through production stages (Concept → Script → Record → Edit → Publish)</li>
                  <li>Get AI assistance at each stage</li>
                  <li>Track performance and iterate</li>
                </ul>
                <p className="text-blue-800 text-sm">
                  For now, your idea has been saved and you can continue getting recommendations in the main dashboard.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <a
                href="/"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium"
              >
                Get More Recommendations
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied! You can come back to this idea later.');
                }}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
              >
                Copy Link to This Idea
              </button>
            </div>
          </div>
        ) : (
          // No idea specified - show overview
          <div className="text-center py-12">
            <div className="bg-white rounded-lg border border-slate-200 p-12 max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">
                Content OS
              </h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Transform your content ideas into published episodes with AI-powered workflows.
              </p>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold text-purple-900 mb-3">How it works:</h3>
                <ol className="space-y-3 text-sm text-purple-800">
                  <li className="flex gap-3">
                    <span className="font-semibold flex-shrink-0">1.</span>
                    <span>Get strategic content recommendations from your AI Growth Architect</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold flex-shrink-0">2.</span>
                    <span>Click "Open in Content OS" to start production</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold flex-shrink-0">3.</span>
                    <span>Follow the guided workflow from concept to published content</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold flex-shrink-0">4.</span>
                    <span>Track performance and improve over time</span>
                  </li>
                </ol>
              </div>

              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Get Content Recommendations
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
