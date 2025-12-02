# Content OS Integration Roadmap
## Step-by-Step Implementation Plan

---

## Phase 1: Database & Infrastructure Setup (Day 1-2)

### Step 1.1: Database Schema
- [ ] Run `supabase-content-os-schema.sql` in Supabase SQL Editor
- [ ] Verify all tables created successfully
- [ ] Test indexes and triggers
- [ ] Confirm foreign key relationships

### Step 1.2: Extend Supabase Types
**File**: `lib/supabase.ts`

Add TypeScript interfaces:
```typescript
// Company
export interface CompanyRow {
  id?: string;
  user_id?: string | null;
  session_id?: string;
  onboarding_id?: string | null;
  name: string;
  description?: string;
  target_audience?: string;
  primary_goal?: string;
  created_at?: string;
  updated_at?: string;
}

// Show
export interface ShowRow {
  id?: string;
  company_id: string;
  name: string;
  format: 'podcast' | 'video' | 'newsletter' | 'linkedin' | 'blog';
  description?: string;
  default_settings?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

// Idea
export interface IdeaRow {
  id?: string;
  company_id: string;
  show_id: string;
  title: string;
  raw_brain_dump?: string;
  structured_concept?: {
    title: string;
    summary: string;
    core_argument: string;
    outline: string[];
    hooks: string[];
    suggested_formats: string[];
    suggested_cta: string;
  };
  source: 'user' | 'architect';
  status: 'raw' | 'concept' | 'promoted';
  context?: {
    target_audience?: string;
    references?: string[];
    preferred_format?: string;
  };
  ai_processing_log?: any;
  created_at?: string;
  updated_at?: string;
}

// Episode
export interface EpisodeRow {
  id?: string;
  idea_id?: string | null;
  company_id: string;
  show_id: string;
  title: string;
  description?: string;
  format: 'podcast' | 'video' | 'newsletter' | 'linkedin' | 'blog';
  status: 'in_progress' | 'completed' | 'archived';
  progress: Record<string, boolean>;
  concept?: any;
  script?: any;
  draft?: any;
  recording?: any;
  filming?: any;
  editing?: any;
  design?: any;
  assets?: any;
  publish?: any;
  created_at?: string;
  updated_at?: string;
}
```

### Step 1.3: Auto-Create Company from Onboarding
**File**: `app/page.tsx`

Modify `handleOnboardingComplete` to create company:
```typescript
const handleOnboardingComplete = async (data: OnboardingData) => {
  // ... existing onboarding save logic ...

  // Create company from onboarding data
  const companyRow: CompanyRow = {
    session_id: sessionId,
    onboarding_id: savedOnboarding.id,
    name: data.profile.companyName,
    description: data.profile.whatYouSell,
    target_audience: data.profile.whoYouSellTo,
    primary_goal: data.profile.primaryGoal,
  };

  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert([companyRow])
    .select()
    .single();

  if (company) {
    // Create default shows based on channels
    const showsToCreate = data.profile.channels.map(channel => ({
      company_id: company.id,
      name: `${channel} Series`,
      format: mapChannelToFormat(channel),
      description: `${channel} content for ${data.profile.companyName}`,
    }));

    await supabase.from('shows').insert(showsToCreate);
  }
};

function mapChannelToFormat(channel: string): string {
  const mapping: Record<string, string> = {
    'Podcast': 'podcast',
    'YouTube': 'video',
    'LinkedIn': 'linkedin',
    'Newsletter': 'newsletter',
    'Blog': 'blog',
  };
  return mapping[channel] || 'blog';
}
```

---

## Phase 2: Copy Content OS Components (Day 2-3)

### Step 2.1: Create Directory Structure
```bash
mkdir -p app/content
mkdir -p components/content/cards
mkdir -p components/content/tabs
mkdir -p components/content/modals
mkdir -p lib/content
```

### Step 2.2: Copy & Adapt Core Components

**From**: `Contentosdevelopment/src/lib/workflows.ts`
**To**: `ai-growth-architect/lib/content/workflows.ts`
- Copy as-is (no changes needed)

**From**: `Contentosdevelopment/src/components/`
**To**: `ai-growth-architect/components/content/`

Files to migrate:
- `Home.tsx` → `components/content/ContentHome.tsx`
- `EpisodeWorkspace.tsx` → `components/content/EpisodeWorkspace.tsx`
- `NewIdeaModal.tsx` → `components/content/modals/NewIdeaModal.tsx`
- `ArchitectRecommendationModal.tsx` → `components/content/modals/ArchitectRecommendationModal.tsx`
- `IdeaCard.tsx` → `components/content/cards/IdeaCard.tsx`
- `EpisodeCard.tsx` → `components/content/cards/EpisodeCard.tsx`
- All `/tabs/*` → `components/content/tabs/`

**Key Adaptations**:
1. Update imports to use Next.js conventions
2. Replace mock data with Supabase hooks
3. Add `"use client"` directive to all interactive components
4. Update image imports to use Next.js `<Image>`

### Step 2.3: Copy Radix UI Components

**From**: `Contentosdevelopment/src/components/ui/`
**To**: `ai-growth-architect/components/ui/`

Content OS uses shadcn/ui components that may not exist in AI Growth Architect. Copy needed components:
- accordion, alert-dialog, avatar, badge, checkbox, dialog, drawer, etc.

Or install via shadcn CLI:
```bash
cd ai-growth-architect
npx shadcn@latest add accordion alert-dialog avatar badge checkbox dialog drawer dropdown-menu hover-card label popover progress radio-group scroll-area select separator slider switch tabs textarea tooltip
```

### Step 2.4: Install Additional Dependencies

```bash
cd ai-growth-architect
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-tooltip class-variance-authority clsx tailwind-merge lucide-react
```

---

## Phase 3: Create Content OS Pages (Day 3-4)

### Step 3.1: Content Home Page
**File**: `app/content/page.tsx`

```typescript
"use client";

import { useState, useEffect } from 'react';
import { ContentHome } from '@/components/content/ContentHome';
import { supabase, getOrCreateSessionId } from '@/lib/supabase';
import type { CompanyRow, ShowRow, IdeaRow, EpisodeRow } from '@/lib/supabase';

export default function ContentPage() {
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [shows, setShows] = useState<ShowRow[]>([]);
  const [ideas, setIdeas] = useState<IdeaRow[]>([]);
  const [episodes, setEpisodes] = useState<EpisodeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const sessionId = getOrCreateSessionId();

    try {
      // Load companies for this session
      const { data: companiesData } = await supabase
        .from('companies')
        .select('*')
        .eq('session_id', sessionId);

      if (companiesData && companiesData.length > 0) {
        setCompanies(companiesData);

        // Load shows
        const { data: showsData } = await supabase
          .from('shows')
          .select('*')
          .in('company_id', companiesData.map(c => c.id));

        setShows(showsData || []);

        // Load ideas
        const { data: ideasData } = await supabase
          .from('ideas')
          .select('*')
          .in('company_id', companiesData.map(c => c.id))
          .neq('status', 'promoted');

        setIdeas(ideasData || []);

        // Load episodes
        const { data: episodesData } = await supabase
          .from('episodes')
          .select('*')
          .in('company_id', companiesData.map(c => c.id))
          .eq('status', 'in_progress');

        setEpisodes(episodesData || []);
      }
    } catch (error) {
      console.error('Error loading content data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <ContentHome
      companies={companies}
      shows={shows}
      ideas={ideas}
      episodes={episodes}
      onRefresh={loadData}
    />
  );
}
```

### Step 3.2: Episode Workspace Page
**File**: `app/content/episode/[id]/page.tsx`

```typescript
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { EpisodeWorkspace } from '@/components/content/EpisodeWorkspace';
import { supabase } from '@/lib/supabase';
import type { EpisodeRow, CompanyRow, ShowRow } from '@/lib/supabase';

export default function EpisodePage() {
  const params = useParams();
  const router = useRouter();
  const [episode, setEpisode] = useState<EpisodeRow | null>(null);
  const [company, setCompany] = useState<CompanyRow | null>(null);
  const [show, setShow] = useState<ShowRow | null>(null);

  useEffect(() => {
    loadEpisode();
  }, [params.id]);

  const loadEpisode = async () => {
    const { data: episodeData } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', params.id)
      .single();

    if (episodeData) {
      setEpisode(episodeData);

      // Load company and show
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', episodeData.company_id)
        .single();
      setCompany(companyData);

      const { data: showData } = await supabase
        .from('shows')
        .select('*')
        .eq('id', episodeData.show_id)
        .single();
      setShow(showData);
    }
  };

  const handleUpdate = async (updatedEpisode: EpisodeRow) => {
    await supabase
      .from('episodes')
      .update(updatedEpisode)
      .eq('id', updatedEpisode.id);

    setEpisode(updatedEpisode);
  };

  if (!episode || !company || !show) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <EpisodeWorkspace
      episode={episode}
      company={company}
      show={show}
      onBack={() => router.push('/content')}
      onUpdate={handleUpdate}
    />
  );
}
```

### Step 3.3: Add Navigation Link
**File**: `app/page.tsx`

Add Content OS link to main nav:
```typescript
<div className="flex items-center justify-between mb-8">
  <div>
    <h1 className="text-3xl font-semibold text-slate-800 mb-2">
      AI Growth Architect
    </h1>
    {/* ... */}
  </div>

  <div className="flex items-center gap-3">
    {/* NEW: Content OS Link */}
    <a
      href="/content"
      className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center gap-2"
    >
      <svg className="w-4 h-4" /* Content icon */ />
      Content OS
    </a>

    {/* Existing settings button */}
    <button onClick={() => setShowOnboarding(true)}>
      {/* ... */}
    </button>
  </div>
</div>
```

---

## Phase 4: AI Integration (Day 4-5)

### Step 4.1: Content AI Service
**File**: `lib/content/ai-service.ts`

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function structureIdea(
  brainDump: string,
  context: {
    companyName: string;
    targetAudience: string;
    showFormat: string;
  }
): Promise<any> {
  const prompt = `You are a content strategist helping ${context.companyName} create content for ${context.targetAudience}.

Based on this brain dump, create a structured content concept:

Brain Dump:
${brainDump}

Format: ${context.showFormat}

Return a JSON object with:
{
  "title": "Compelling title",
  "summary": "2-3 sentence summary",
  "core_argument": "The main point or thesis",
  "outline": ["Point 1", "Point 2", "Point 3", ...],
  "hooks": ["Hook option 1", "Hook option 2", "Hook option 3"],
  "suggested_formats": ["podcast", "linkedin", etc],
  "suggested_cta": "Call to action"
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(completion.choices[0].message.content || '{}');
}

export async function generateScript(
  concept: any,
  format: string
): Promise<string> {
  // Implementation for script generation
  // ...
}

export async function refineContent(
  content: string,
  instruction: string
): Promise<string> {
  // Implementation for content refinement
  // ...
}
```

### Step 4.2: Content API Routes
**File**: `app/api/content/ai-assist/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { structureIdea, generateScript, refineContent } from '@/lib/content/ai-service';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { operation, data } = body;

  try {
    let result;

    switch (operation) {
      case 'structure_idea':
        result = await structureIdea(
          data.brainDump,
          data.context
        );
        break;

      case 'generate_script':
        result = await generateScript(
          data.concept,
          data.format
        );
        break;

      case 'refine_content':
        result = await refineContent(
          data.content,
          data.instruction
        );
        break;

      default:
        return NextResponse.json({ error: 'Unknown operation' }, { status: 400 });
    }

    // Log AI usage
    await supabase.from('ai_assistance_log').insert({
      session_id: data.sessionId,
      entity_type: data.entityType,
      entity_id: data.entityId,
      operation,
      // Add token counting logic
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error('AI assist error:', error);
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
  }
}
```

---

## Phase 5: Architect → Content OS Integration (Day 5-6)

### Step 5.1: Add Content Recommendations to Chat

**Modify**: `app/api/growth-architect/route.ts`

Extend AI prompt to suggest content:
```typescript
const systemPrompt = `You are an AI Growth Architect...

When recommending content creation, format it like this:
[CONTENT_RECOMMENDATION]
{
  "title": "Content title",
  "rationale": "Why this content now",
  "format": "podcast|video|linkedin|newsletter|blog",
  "angle": "Educational|Thought Leadership|Case Study"
}
[/CONTENT_RECOMMENDATION]`;
```

### Step 5.2: Parse and Display Content Recommendations

**Modify**: `components/ChatWindow.tsx`

Add recommendation card rendering:
```typescript
function parseContentRecommendation(text: string) {
  const match = text.match(/\[CONTENT_RECOMMENDATION\](.*?)\[\/CONTENT_RECOMMENDATION\]/s);
  if (match) {
    return JSON.parse(match[1]);
  }
  return null;
}

// In render:
const recommendation = parseContentRecommendation(message.text);
if (recommendation) {
  return <ContentRecommendationCard recommendation={recommendation} />;
}
```

### Step 5.3: Quick Action: "Kick Off Production"

**Component**: `components/content/ContentRecommendationCard.tsx`

```typescript
export function ContentRecommendationCard({ recommendation }: Props) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <div className="flex-1">
          <h4 className="text-slate-900 mb-2">{recommendation.title}</h4>
          <p className="text-slate-700 text-sm mb-3">{recommendation.rationale}</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            🚀 Kick Off Production
          </button>
        </div>
      </div>

      {showModal && (
        <ArchitectRecommendationModal
          recommendation={recommendation}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
```

---

## Phase 6: Testing & Polish (Day 6-7)

### Step 6.1: End-to-End Flow Testing
1. Complete onboarding → Company created
2. Chat with Architect → Content recommendation
3. Kick off production → Idea created
4. Navigate to Content OS → See idea
5. Promote to episode → Workspace opens
6. Progress through tabs → AI assists at each stage
7. Mark as published → Performance tracking

### Step 6.2: UI Polish
- [ ] Consistent styling between chat and Content OS
- [ ] Loading states for all AI operations
- [ ] Error handling and user feedback
- [ ] Mobile responsiveness
- [ ] Keyboard shortcuts for power users

### Step 6.3: Performance Optimization
- [ ] Implement React Query for data fetching
- [ ] Add optimistic updates
- [ ] Lazy load heavy components
- [ ] Image optimization with Next.js Image

---

## Phase 7: Deployment (Day 7)

### Step 7.1: Environment Variables
Add to Vercel:
```
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Step 7.2: Database Migration
- [ ] Run schema in production Supabase
- [ ] Test with production data
- [ ] Set up database backups

### Step 7.3: Deploy to Vercel
```bash
git add .
git commit -m "Integrate Content OS into AI Growth Architect"
git push origin main
# Vercel auto-deploys
```

---

## Success Metrics

After integration, you should have:
- ✅ Unified app: ai-growth-architect.vercel.app
- ✅ Seamless flow: Strategy → Execution → Analytics
- ✅ AI-powered workflows at every stage
- ✅ Performance data feeding back to Architect
- ✅ Single source of truth in Supabase

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing features | Create feature branch, extensive testing |
| Data migration issues | Test schema on dev instance first |
| AI costs too high | Implement usage limits and caching |
| Performance degradation | Load testing, optimize queries |
| UI inconsistencies | Design system audit before migration |

---

## Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1: Database | 1-2 days | Day 2 |
| Phase 2: Components | 1-2 days | Day 4 |
| Phase 3: Pages | 1 day | Day 5 |
| Phase 4: AI | 1 day | Day 6 |
| Phase 5: Integration | 1 day | Day 7 |
| Phase 6: Testing | 1 day | Day 8 |
| Phase 7: Deploy | 0.5 days | Day 8.5 |

**Total: 8-9 days of focused development**

---

## Next Steps

1. Review this plan
2. Decide: Feature branch or direct to main?
3. Run Phase 1 (database) first
4. Proceed phase by phase
5. Test thoroughly at each phase

Ready to start? Let me know which phase you'd like to tackle first!
