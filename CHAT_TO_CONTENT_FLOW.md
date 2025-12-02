# Chat-to-Content OS Flow
## Seamless Handoff from AI Recommendations to Content Production

---

## User Experience Flow

### Step 1: User Asks for Content Ideas
```
User: "Give me content ideas for this month"

AI Growth Architect: "Based on your profile, here are 3 high-impact content ideas:

1. **Podcast: Why AI Chatbots Fail in Healthcare**
   Target: Healthcare executives evaluating AI
   Angle: Educational + Risk mitigation
   Why now: Your ICP is in evaluation phase

   [Open in Content OS →]

2. **LinkedIn Post: The 5-Minute Patient Intake Revolution**
   Target: Practice managers
   Angle: Quick win + Social proof
   Why now: Trending topic in your industry

   [Open in Content OS →]

3. **Newsletter: Hybrid Intelligence Implementation Guide**
   Target: Healthcare CTOs
   Angle: Thought leadership + Lead magnet
   Why now: Complements your current campaign

   [Open in Content OS →]
```

### Step 2: User Clicks "Open in Content OS"
- Creates Idea in database with AI recommendation data
- Redirects to `/content?idea=[id]`
- Content OS highlights the new idea, ready to promote to episode

### Step 3: Content OS Takes Over
- User sees the idea pre-structured by AI
- Can refine or immediately promote to episode
- Continues through production workflow

---

## Technical Implementation

### Part 1: Update AI Growth Architect Prompt

**File**: `app/api/growth-architect/route.ts`

```typescript
const systemPrompt = `You are an AI Growth Architect helping ${companyName} with strategic growth initiatives.

When suggesting content creation, use this EXACT format for each recommendation:

[CONTENT_IDEA]
{
  "title": "Engaging title for the content",
  "format": "podcast|video|linkedin|newsletter|blog",
  "rationale": "Why this content matters right now (2-3 sentences)",
  "angle": "Educational|Thought Leadership|Case Study|How-To",
  "targetAudience": "Specific audience segment",
  "structuredConcept": {
    "summary": "2-3 sentence summary of the content",
    "coreArgument": "The main thesis or point",
    "outline": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
    "hooks": ["Hook option 1", "Hook option 2", "Hook option 3"],
    "suggestedCta": "Call to action for the audience"
  }
}
[/CONTENT_IDEA]

After each recommendation, the user will see a button to open it in Content OS.
Be specific and actionable. Focus on high-impact ideas aligned with their goals.`;
```

### Part 2: Parse Content Ideas in Chat

**File**: `components/MessageBubble.tsx`

```typescript
import { Sparkles, ArrowRight } from 'lucide-react';

interface ContentIdea {
  title: string;
  format: string;
  rationale: string;
  angle: string;
  targetAudience: string;
  structuredConcept: any;
}

function parseContentIdeas(text: string): { ideas: ContentIdea[]; cleanText: string } {
  const regex = /\[CONTENT_IDEA\](.*?)\[\/CONTENT_IDEA\]/gs;
  const ideas: ContentIdea[] = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    try {
      const idea = JSON.parse(match[1].trim());
      ideas.push(idea);
    } catch (e) {
      console.error('Failed to parse content idea:', e);
    }
  }

  // Remove the JSON blocks from display text
  const cleanText = text.replace(regex, '').trim();

  return { ideas, cleanText };
}

export default function MessageBubble({ message }: { message: any }) {
  const { ideas, cleanText } = parseContentIdeas(message.text);

  if (message.sender === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-blue-600 text-white rounded-2xl px-4 py-3 max-w-lg">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 max-w-2xl">
        {/* Display clean text */}
        <p className="text-slate-800 mb-4 whitespace-pre-wrap">{cleanText}</p>

        {/* Display content idea cards */}
        {ideas.map((idea, index) => (
          <ContentIdeaCard key={index} idea={idea} index={index + 1} />
        ))}
      </div>
    </div>
  );
}

function ContentIdeaCard({ idea, index }: { idea: ContentIdea; index: number }) {
  const [creating, setCreating] = useState(false);

  const handleOpenInContentOS = async () => {
    setCreating(true);

    try {
      // Create the idea in the database
      const response = await fetch('/api/content/create-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: idea.title,
          format: idea.format,
          rationale: idea.rationale,
          angle: idea.angle,
          targetAudience: idea.targetAudience,
          structuredConcept: idea.structuredConcept,
          source: 'architect',
        }),
      });

      const data = await response.json();

      if (data.ideaId) {
        // Redirect to Content OS with the new idea
        window.location.href = `/content?idea=${data.ideaId}&action=open`;
      }
    } catch (error) {
      console.error('Failed to create idea:', error);
      alert('Failed to create idea. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-3">
      <div className="flex items-start gap-3">
        <div className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
          {index}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h4 className="text-slate-900 font-semibold">{idea.title}</h4>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs capitalize flex-shrink-0">
              {idea.format}
            </span>
          </div>

          <p className="text-slate-700 text-sm mb-3">{idea.rationale}</p>

          <div className="flex items-center gap-4 text-xs text-slate-600 mb-3">
            <div>
              <span className="font-medium">Target:</span> {idea.targetAudience}
            </div>
            <div>
              <span className="font-medium">Angle:</span> {idea.angle}
            </div>
          </div>

          <button
            onClick={handleOpenInContentOS}
            disabled={creating}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 disabled:opacity-50"
          >
            {creating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Open in Content OS
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Part 3: API Endpoint to Create Idea from Chat

**File**: `app/api/content/create-idea/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase, getOrCreateSessionId } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sessionId = getOrCreateSessionId();

    // Get or create company for this session
    let { data: companies } = await supabase
      .from('companies')
      .select('*')
      .eq('session_id', sessionId)
      .limit(1);

    let company = companies?.[0];

    if (!company) {
      // No company yet - need to complete onboarding first
      return NextResponse.json(
        { error: 'Please complete onboarding first' },
        { status: 400 }
      );
    }

    // Get appropriate show for this format
    let { data: shows } = await supabase
      .from('shows')
      .select('*')
      .eq('company_id', company.id)
      .eq('format', body.format)
      .limit(1);

    let show = shows?.[0];

    // If no show exists for this format, create one
    if (!show) {
      const { data: newShow, error: showError } = await supabase
        .from('shows')
        .insert({
          company_id: company.id,
          name: `${body.format.charAt(0).toUpperCase() + body.format.slice(1)} Series`,
          format: body.format,
          description: `${body.format} content for ${company.name}`,
        })
        .select()
        .single();

      if (showError) throw showError;
      show = newShow;
    }

    // Create the idea
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .insert({
        company_id: company.id,
        show_id: show.id,
        title: body.title,
        raw_brain_dump: `${body.rationale}\n\nAngle: ${body.angle}\nTarget: ${body.targetAudience}`,
        structured_concept: body.structuredConcept,
        source: 'architect',
        status: 'concept',
        context: {
          target_audience: body.targetAudience,
          angle: body.angle,
        },
      })
      .select()
      .single();

    if (ideaError) throw ideaError;

    // Track analytics
    await supabase.from('analytics_events').insert({
      session_id: sessionId,
      event_type: 'content_idea_created_from_chat',
      event_data: {
        idea_id: idea.id,
        format: body.format,
        source: 'architect',
      },
    });

    return NextResponse.json({
      ideaId: idea.id,
      showId: show.id,
      success: true
    });
  } catch (error) {
    console.error('Error creating idea:', error);
    return NextResponse.json(
      { error: 'Failed to create idea' },
      { status: 500 }
    );
  }
}
```

### Part 4: Content OS Page Handles Incoming Ideas

**File**: `app/content/page.tsx`

```typescript
"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ContentHome } from '@/components/content/ContentHome';
import { NewIdeaModal } from '@/components/content/modals/NewIdeaModal';
import { supabase, getOrCreateSessionId } from '@/lib/supabase';

export default function ContentPage() {
  const searchParams = useSearchParams();
  const incomingIdeaId = searchParams.get('idea');
  const action = searchParams.get('action');

  const [companies, setCompanies] = useState([]);
  const [shows, setShows] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [highlightedIdeaId, setHighlightedIdeaId] = useState<string | null>(null);
  const [showIdeaModal, setShowIdeaModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Handle incoming idea from chat
    if (incomingIdeaId && action === 'open') {
      setHighlightedIdeaId(incomingIdeaId);

      // Auto-scroll to the idea
      setTimeout(() => {
        const ideaElement = document.getElementById(`idea-${incomingIdeaId}`);
        ideaElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);

      // Show a toast notification
      showNotification('Content idea ready! Review and promote to episode when ready.');
    }
  }, [incomingIdeaId, action]);

  const loadData = async () => {
    const sessionId = getOrCreateSessionId();

    try {
      const { data: companiesData } = await supabase
        .from('companies')
        .select('*')
        .eq('session_id', sessionId);

      if (companiesData && companiesData.length > 0) {
        setCompanies(companiesData);

        const companyIds = companiesData.map(c => c.id);

        // Load shows
        const { data: showsData } = await supabase
          .from('shows')
          .select('*')
          .in('company_id', companyIds);
        setShows(showsData || []);

        // Load ideas
        const { data: ideasData } = await supabase
          .from('ideas')
          .select('*')
          .in('company_id', companyIds)
          .neq('status', 'promoted')
          .order('created_at', { ascending: false });
        setIdeas(ideasData || []);

        // Load episodes
        const { data: episodesData } = await supabase
          .from('episodes')
          .select('*')
          .in('company_id', companyIds)
          .eq('status', 'in_progress')
          .order('updated_at', { ascending: false });
        setEpisodes(episodesData || []);
      }
    } catch (error) {
      console.error('Error loading content data:', error);
    }
  };

  return (
    <>
      <ContentHome
        companies={companies}
        shows={shows}
        ideas={ideas}
        episodes={episodes}
        highlightedIdeaId={highlightedIdeaId}
        onRefresh={loadData}
      />

      {/* Modals, etc. */}
    </>
  );
}

function showNotification(message: string) {
  // Simple toast notification
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
```

### Part 5: Highlight Incoming Ideas

**File**: `components/content/cards/IdeaCard.tsx`

```typescript
import { Sparkles, ArrowRight } from 'lucide-react';
import type { IdeaRow } from '@/lib/supabase';

interface IdeaCardProps {
  idea: IdeaRow;
  onPromote: (idea: IdeaRow) => void;
  highlighted?: boolean;
}

export function IdeaCard({ idea, onPromote, highlighted }: IdeaCardProps) {
  const hasStructuredConcept = !!idea.structured_concept;

  return (
    <div
      id={`idea-${idea.id}`}
      className={`bg-white border rounded-lg p-5 hover:border-slate-300 transition-all ${
        highlighted
          ? 'border-purple-500 shadow-lg ring-2 ring-purple-200 animate-pulse-slow'
          : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Highlight badge for new ideas from chat */}
          {highlighted && (
            <div className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs mb-2">
              <Sparkles className="w-3 h-3" />
              New from AI Architect
            </div>
          )}

          <h4 className="text-slate-900 mb-2">
            {idea.structured_concept?.title || idea.title}
          </h4>

          <p className="text-slate-600 text-sm mb-3 line-clamp-2">
            {idea.structured_concept?.summary || idea.raw_brain_dump}
          </p>

          {/* Tags */}
          <div className="flex items-center gap-2 mb-3">
            {!hasStructuredConcept && (
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                Not yet processed
              </span>
            )}
            {idea.source === 'architect' && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                From Architect
              </span>
            )}
          </div>

          {/* Action Button */}
          {hasStructuredConcept && (
            <button
              onClick={() => onPromote(idea)}
              className={`${
                highlighted
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              } px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm font-medium`}
            >
              Turn into Episode
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Updated Navigation

### Simple Top Nav Addition

**File**: `app/page.tsx` (AI Growth Architect main page)

```typescript
<div className="flex items-center justify-between mb-8">
  <div>
    <h1 className="text-3xl font-semibold text-slate-800 mb-2">
      AI Growth Architect
    </h1>
    <p className="text-slate-500">
      Get intelligent recommendations and strategic guidance
    </p>
  </div>

  <div className="flex items-center gap-3">
    {/* Content OS Link */}
    <a
      href="/content"
      className="px-4 py-2 text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg transition flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Content OS
    </a>

    {/* Settings */}
    <button
      onClick={() => setShowOnboarding(true)}
      className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      Settings
    </button>
  </div>
</div>
```

---

## Example User Journey

### Scenario: User wants content ideas

**Chat Conversation:**
```
User: "I need content ideas to generate leads this month"

AI Architect: "Based on your healthcare AI platform and target audience
of practice managers, here are 3 high-impact content ideas for lead generation:

[CONTENT_IDEA displays as card]
1. Podcast: "Why AI Chatbots Fail in Healthcare (And What Works Instead)"
   - Addresses main pain point: failed AI implementations
   - Target: Healthcare executives in evaluation phase
   - [Open in Content OS →]

[CONTENT_IDEA displays as card]
2. LinkedIn Carousel: "5 Questions to Ask Before Buying Healthcare AI"
   - Easy to consume, highly shareable format
   - Target: Decision-makers comparing vendors
   - [Open in Content OS →]

[CONTENT_IDEA displays as card]
3. Newsletter: "The Hybrid Intelligence Implementation Playbook"
   - Lead magnet opportunity
   - Target: Healthcare CTOs ready to implement
   - [Open in Content OS →]

These align with your primary goal of generating qualified leads.
Would you like me to suggest specific promotion strategies for any of these?"

User: [Clicks "Open in Content OS" on #1]

→ Redirects to /content?idea=123&action=open
→ Content OS page loads
→ Idea #1 is highlighted and auto-scrolled into view
→ User sees: "✨ New from AI Architect"
→ User clicks "Turn into Episode"
→ Episode workspace opens, ready to create
```

---

## Simplified Implementation Steps

### Week 1: Core Handoff
1. ✅ Database schema (already created: `supabase-content-os-schema.sql`)
2. Update AI prompt to output `[CONTENT_IDEA]` format
3. Update `MessageBubble.tsx` to parse and display content cards
4. Create `/api/content/create-idea` endpoint
5. Test: Chat → Click button → Idea created

### Week 2: Content OS Pages
6. Create `/app/content/page.tsx` with data loading
7. Migrate Content OS components from prototype
8. Handle `?idea=X&action=open` query params
9. Add highlighting for incoming ideas
10. Test: Full flow from chat to workspace

### Week 3: AI Integration
11. Add AI endpoints for script generation, refinement
12. Wire up AI assistance in each workflow tab
13. Test: Create episode, use AI at each stage
14. Polish UI and loading states

---

## Benefits of This Approach

✅ **Clean separation**: Chat = strategy, Content OS = execution
✅ **Minimal disruption**: Existing chat flow stays intact
✅ **Progressive enhancement**: Can use Content OS directly OR via chat
✅ **Clear handoff**: User explicitly chooses to start production
✅ **Analytics**: Track conversion from recommendation to creation

Ready to implement this? I can help you start with any phase!
