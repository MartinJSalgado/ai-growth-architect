# Recommendation Engine Implementation Guide
## Step-by-Step Setup Instructions

---

## What We've Built So Far

✅ **recommendation-agent.ts** - Context-aware AI prompt system
✅ **Updated API route** - Uses new recommendation engine

---

## Next Steps to Complete

### Step 1: Update Main Page to Send Full Context

**File**: `app/page.tsx`

**Find this function** (around line 214):
```typescript
const sendMessage = async (messageText: string, isAutomatic = false) => {
```

**Replace with**:
```typescript
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
        // Old format (for backward compat)
        companyDescription: onboardingData?.profile.whatYouSell || "",
        goal: onboardingData?.profile.primaryGoal || "",
        metrics: formatMetricsForAPI(onboardingData),
        userMessage: messageText,

        // NEW: Full context for recommendation engine
        onboardingData: onboardingData,
        ghlMetrics: ghlMetrics,
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
```

---

### Step 2: Create ContentIdeaCard Component

**Create file**: `components/ContentIdeaCard.tsx`

```typescript
"use client";

import { useState } from 'react';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';

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
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating idea...
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

---

### Step 3: Update MessageBubble Component

**File**: `components/MessageBubble.tsx`

**Replace entire file with**:
```typescript
import { ContentIdeaCard, type ContentIdea } from './ContentIdeaCard';

interface Message {
  sender: string;
  text: string;
}

interface MessageBubbleProps {
  message: Message;
}

function parseContentIdeas(text: string): { ideas: ContentIdea[]; cleanText: string } {
  const regex = /\[CONTENT_IDEA\](.*?)\[\/CONTENT_IDEA\]/gs;
  const ideas: ContentIdea[] = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    try {
      const ideaJson = match[1].trim();
      const idea = JSON.parse(ideaJson);
      ideas.push(idea);
    } catch (e) {
      console.error('Failed to parse content idea:', e);
    }
  }

  // Remove the JSON blocks from display text
  const cleanText = text.replace(regex, '').trim();

  return { ideas, cleanText };
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  // User messages
  if (message.sender === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-blue-600 text-white rounded-2xl px-4 py-3 max-w-lg">
          {message.text}
        </div>
      </div>
    );
  }

  // AI messages - parse for content ideas
  const { ideas, cleanText } = parseContentIdeas(message.text);

  return (
    <div className="flex justify-start mb-6">
      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 max-w-3xl">
        {/* Clean message text */}
        {cleanText && (
          <div className="text-slate-800 mb-4 whitespace-pre-wrap leading-relaxed">
            {cleanText}
          </div>
        )}

        {/* Content idea cards */}
        {ideas.length > 0 && (
          <div className="space-y-3 mt-4">
            {ideas.map((idea, index) => (
              <ContentIdeaCard key={index} idea={idea} index={index + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### Step 4: Create API Endpoint to Save Ideas

**Create directory**: `app/api/content`
**Create file**: `app/api/content/create-idea/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase, getOrCreateSessionId } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sessionId = getOrCreateSessionId();

    // Get company for this session (from onboarding)
    const { data: companies } = await supabase
      .from('companies')
      .select('*')
      .eq('session_id', sessionId)
      .limit(1);

    let company = companies?.[0];

    if (!company) {
      return NextResponse.json(
        { error: 'Please complete onboarding first to create content ideas' },
        { status: 400 }
      );
    }

    // Get or create show for this format
    const { data: shows } = await supabase
      .from('shows')
      .select('*')
      .eq('company_id', company.id)
      .eq('format', body.format)
      .limit(1);

    let show = shows?.[0];

    if (!show) {
      // Create show for this format
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

      if (showError) {
        console.error('Error creating show:', showError);
        throw showError;
      }
      show = newShow;
    }

    // Create the idea
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .insert({
        company_id: company.id,
        show_id: show.id,
        title: body.title,
        raw_brain_dump: `AI Architect Recommendation:\n\n${body.rationale}\n\nAngle: ${body.angle}\nTarget: ${body.targetAudience}\nBuyer Stage: ${body.buyerStage}\n\nExpected Impact: ${body.expectedImpact?.reasoning || 'N/A'}`,
        structured_concept: body.structuredConcept,
        source: 'architect',
        status: 'concept',
        context: {
          target_audience: body.targetAudience,
          angle: body.angle,
          buyer_stage: body.buyerStage,
          expected_impact: body.expectedImpact,
        },
      })
      .select()
      .single();

    if (ideaError) {
      console.error('Error creating idea:', ideaError);
      throw ideaError;
    }

    // Track analytics event
    await supabase.from('analytics_events').insert({
      session_id: sessionId,
      event_type: 'content_idea_created_from_chat',
      event_data: {
        idea_id: idea.id,
        format: body.format,
        source: 'architect',
        target_audience: body.targetAudience,
        buyer_stage: body.buyerStage,
      },
    });

    return NextResponse.json({
      success: true,
      ideaId: idea.id,
      showId: show.id,
    });
  } catch (error) {
    console.error('Error in create-idea:', error);
    return NextResponse.json(
      { error: 'Failed to create idea. Please try again.' },
      { status: 500 }
    );
  }
}
```

---

### Step 5: Install Required Icons

```bash
cd ai-growth-architect
npm install lucide-react
```

---

## Testing the Flow

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test Sequence

1. **Complete onboarding** (if you haven't already)
   - Fill out company profile
   - Complete FABRIC assessment
   - Select brand personality

2. **Ask for content ideas**
   ```
   User: "Give me 3 content ideas to generate leads this month"
   ```

3. **Verify AI response includes**:
   - Strategic recommendations with context
   - [CONTENT_IDEA] JSON blocks
   - Rendered as beautiful cards
   - "Open in Content OS" button

4. **Click "Open in Content OS"**
   - Should create idea in database
   - Redirect to `/content?idea=[id]&action=open`
   - (Note: Content OS page doesn't exist yet, will show 404)

5. **Check database**:
   ```sql
   SELECT * FROM ideas ORDER BY created_at DESC LIMIT 1;
   ```

---

## What You'll See

### Before (Generic):
```
AI: "Here are some content ideas:
1. Create a podcast about your industry
2. Write blog posts about your product
3. Post on LinkedIn regularly"
```

### After (Context-Aware):
```
AI: "Based on your profile and current situation:

Pipeline Analysis: You have 24 active opportunities worth $340K.
This shows strong evaluation momentum.

FABRIC Gaps: Release (2/5) and Compound (1/5) suggest you need
better distribution and growth loop content.

Here are 3 high-impact recommendations:

[Beautiful Card 1]
📊 PODCAST: Why 68% of Healthcare AI Chatbots Fail...
Target: Healthcare CTOs evaluating AI vendors
Why now: Your prospects are in evaluation phase...
Lead Gen Potential: High
[Open in Content OS →]

[Beautiful Card 2]
...
```

---

## Troubleshooting

### Issue: "Please complete onboarding first"
**Fix**: Make sure you've completed the onboarding flow

### Issue: Module not found '@/lib/content/recommendation-agent'
**Fix**: Restart your dev server after creating the new file

### Issue: Ideas not appearing in cards
**Fix**: Check browser console for JSON parsing errors

### Issue: Database errors
**Fix**: Make sure you've run `supabase-content-os-schema.sql`

---

## Next Steps After This Works

Once you have recommendations showing in chat:

1. **Build Content OS pages** (Week 2)
2. **Add AI script generation** (Week 3)
3. **Performance tracking loop** (Week 4)

---

Ready to implement? Start with **Step 1** and work through each step in order.

Let me know if you hit any issues!
