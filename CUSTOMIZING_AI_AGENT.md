# Customizing Your AI Recommendation Agent
## Easy Updates, No Code Complexity

---

## Architecture: Built for Customization

The recommendation system is **modular and text-based**, making it easy to update:

```
lib/content/recommendation-agent.ts  ← All prompts and logic here
    ↓
app/api/growth-architect/route.ts    ← Just calls the agent
    ↓
components/MessageBubble.tsx         ← Just displays results
```

**Key Point**: All the "intelligence" lives in ONE file that's easy to edit!

---

## What You Can Customize

### 1. **Add New Frameworks** (5 minutes)

**Example: Adding "StoryBrand Framework"**

**File**: `lib/content/recommendation-agent.ts`

**Find** (around line 30):
```typescript
Use the FABRIC/Growth System model:
- Foundation – positioning, ICP, offer.
- Architecture – buyer journey, funnels, stages.
...
```

**Add your framework**:
```typescript
Use the FABRIC/Growth System model:
- Foundation – positioning, ICP, offer.
...

ALSO consider the StoryBrand Framework:
- Character: Who is the hero (the customer)?
- Problem: External, internal, philosophical problems
- Guide: How you position as the guide
- Plan: Simple 3-step process
- Call to Action: Direct and transitional CTAs
- Success: What does winning look like?
- Failure: What's at stake?

When recommending content:
- Frame recommendations using StoryBrand elements
- Identify which part of the story this content tells
- Ensure content positions customer as hero, not your brand
```

**That's it!** Next recommendation will use both frameworks.

---

### 2. **Update Quality Standards** (2 minutes)

**File**: `lib/content/recommendation-agent.ts`

**Find** (around line 150):
```typescript
# QUALITY STANDARDS (CRITICAL)

✓ SPECIFIC over generic
  ❌ "Top 10 AI Trends in Healthcare"
  ✅ "Why 68% of Healthcare AI Chatbots Fail (And the 3 That Don't)"
```

**Add your standards**:
```typescript
✓ SPECIFIC over generic
  ❌ "Top 10 AI Trends in Healthcare"
  ✅ "Why 68% of Healthcare AI Chatbots Fail (And the 3 That Don't)"

✓ CONTROVERSIAL over safe (NEW)
  ❌ "Best Practices for Patient Care"
  ✅ "Why Your Patient Satisfaction Scores Are Lying to You"

✓ TACTICAL over theoretical (NEW)
  ❌ "The Importance of Data-Driven Decisions"
  ✅ "The 3 Metrics That Actually Predict Patient Retention (Hint: It's Not CSAT)"

✓ TIMELY over evergreen (NEW)
  - Reference current events, recent studies, trending topics
  - Example: "Post-Pandemic Healthcare: The 3 AI Use Cases That Actually Stuck"
```

---

### 3. **Add Industry Best Practices** (10 minutes)

**File**: `lib/content/recommendation-agent.ts`

**Add a new section**:
```typescript
# CONTENT BEST PRACTICES (Your Custom Rules)

## Title Formulas That Work:
1. Number + Specific Outcome + Timeframe
   - "7 Ways to Cut Patient Wait Times by 40% in 30 Days"

2. Why + Surprising Stat + (And What Actually Works)
   - "Why 72% of Healthcare AI Projects Fail (And the 3 That Don't)"

3. The [Something] That [Big Promise]
   - "The Patient Intake Change That Generated $2.3M in New Revenue"

4. Challenge + Contrarian Take
   - "Stop Measuring Patient Satisfaction. Track This Instead."

## Hook Formulas:
- Stat shock: "X% of Y do Z. Here's why that matters..."
- Contrarian: "Everyone says X. But the data shows Y..."
- Personal story: "Yesterday, a [person] told me [shocking thing]..."
- Pattern recognition: "I analyzed X [things]. Here's what shocked me..."

## Outline Structure:
1. Hook (stat, story, or question)
2. Why this matters now (context, urgency)
3. The problem deeper (beyond surface level)
4. Framework or solution (your unique take)
5. Proof (case study, data, example)
6. Action steps (what they should do)
7. CTA (stage-appropriate)

Use these formulas in your recommendations.
```

---

### 4. **Add Format-Specific Guidelines** (5 minutes per format)

**Example: LinkedIn Best Practices**

```typescript
# FORMAT-SPECIFIC BEST PRACTICES

## LinkedIn Posts:
- First line = hook (make them stop scrolling)
- Use whitespace (2-3 line paragraphs max)
- Include a visual (carousel, infographic, or video)
- Personal stories > abstract concepts
- End with a question to drive comments
- Optimal length: 1,300-1,500 characters
- Best posting times: Tuesday-Thursday, 8-10am EST

Avoid:
❌ Starting with "I'm excited to announce..."
❌ Long blocks of text
❌ Corporate jargon
❌ Asking for likes/shares

Do:
✅ Lead with a surprising stat or story
✅ Use "you" not "we"
✅ Include specific numbers and outcomes
✅ End with an open-ended question

## Podcast Episodes:
- Length: 15-25 minutes (sweet spot for B2B)
- Structure: Cold open → Intro → 3 main points → Recap → CTA
- Stories > theory (aim for 60/40 story-to-concept ratio)
- One clear takeaway per episode
- Guest interviews: Focus on their stories, not their products
- Solo episodes: Teach one framework or share one insight deeply

Avoid:
❌ 60+ minute episodes (unless interviewing a celebrity)
❌ Multiple topics per episode
❌ Heavy editing (keep it conversational)

Do:
✅ Start with a story or question
✅ Pause for emphasis
✅ Repeat key points 2-3 times
✅ End with ONE clear action step
```

---

### 5. **Version Your Prompts** (For A/B Testing)

Create multiple prompt versions to test:

```typescript
// Version control for prompt iterations
const PROMPT_VERSIONS = {
  v1_baseline: {
    name: 'Original FABRIC-focused',
    systemPrompt: `...original prompt...`,
    temperature: 0.8,
  },

  v2_storybrand: {
    name: 'FABRIC + StoryBrand',
    systemPrompt: `...includes StoryBrand framework...`,
    temperature: 0.8,
  },

  v3_contrarian: {
    name: 'Emphasis on contrarian angles',
    systemPrompt: `...emphasizes controversial takes...`,
    temperature: 0.9, // Higher creativity
  },
};

// Use environment variable to switch versions
const ACTIVE_VERSION = process.env.AI_PROMPT_VERSION || 'v2_storybrand';

export function buildRecommendationPrompt(context: CompanyContext, userMessage: string): string {
  const version = PROMPT_VERSIONS[ACTIVE_VERSION];
  return version.systemPrompt;
}
```

Then in `.env.local`:
```
AI_PROMPT_VERSION=v2_storybrand
```

Change and restart server to test new versions!

---

### 6. **Add Dynamic Context Rules**

Make recommendations adapt based on data:

```typescript
function buildRecommendationPrompt(context: CompanyContext, userMessage: string): string {
  let prompt = BASE_PROMPT;

  // Dynamic rules based on company stage
  if (context.ghlMetrics?.pipeline?.totalOpportunities < 10) {
    prompt += `\n# CURRENT PRIORITY: Top-of-Funnel Awareness
    - Recommend educational content that drives discovery
    - Focus on problem awareness, not solution selling
    - Formats: LinkedIn posts, short videos, podcasts
    - CTAs: Free resources, not demos`;
  } else if (context.ghlMetrics?.pipeline?.totalOpportunities > 50) {
    prompt += `\n# CURRENT PRIORITY: Conversion & Nurture
    - Recommend content that addresses objections
    - Focus on case studies, implementation guides
    - Formats: Deep-dive content, comparison guides
    - CTAs: Demos, consultations, trials`;
  }

  // Dynamic rules based on FABRIC gaps
  const releaseScore = context.fabricMaturity.release;
  if (releaseScore <= 2) {
    prompt += `\n# FABRIC GAP: Release (Distribution)
    - Recommend content that's easy to repurpose
    - Pillar content that atomizes into 10+ pieces
    - Include distribution strategy in rationale
    - Multi-channel opportunities`;
  }

  // Dynamic rules based on brand personality
  if (context.brandPersonality.includes('Contrarian')) {
    prompt += `\n# BRAND VOICE: Contrarian
    - Lead with surprising or counter-intuitive takes
    - Challenge industry assumptions
    - Use phrases like "Everyone says X, but..." or "The data shows the opposite..."`;
  }

  return prompt;
}
```

---

### 7. **Save and Learn from Performance**

Track which recommendations work:

```typescript
// After content is published and has metrics
export async function updatePromptBasedOnPerformance() {
  // Get top-performing content
  const topContent = await supabase
    .from('content_performance_overview')
    .select('*')
    .order('engagement_score', { ascending: false })
    .limit(10);

  // Analyze what worked
  const patterns = analyzePatterns(topContent);

  // Update prompt with learnings
  const learnings = `
# WHAT'S WORKING (Based on Performance Data)

Top-performing titles include:
${patterns.titlePatterns.map(p => `- ${p.pattern} (avg engagement: ${p.score})`).join('\n')}

Hooks that drive clicks:
${patterns.hookPatterns.map(p => `- "${p.example}"`).join('\n')}

Formats performing best:
${patterns.topFormats.map(f => `- ${f.format}: ${f.avgEngagement} avg engagement`).join('\n')}

Use these patterns in future recommendations.
`;

  // Save to prompt file or database
  await updatePromptLearnings(learnings);
}
```

---

## Real-World Customization Examples

### Example 1: Adding "Jobs-to-be-Done" Framework

**Before**:
AI recommends content based on FABRIC alone

**After** (5-minute edit):
```typescript
# JOBS-TO-BE-DONE LENS

When recommending content, identify:
1. What "job" is the customer hiring content to do?
   - Functional job: "Learn how to reduce wait times"
   - Emotional job: "Feel confident in AI decision"
   - Social job: "Be seen as innovative leader"

2. What progress are they trying to make?
   - Away from: Current frustration/pain
   - Toward: Desired outcome/state

Content should help them make progress on that job.

Example:
❌ Generic: "How AI Improves Healthcare"
✅ JTBD-aligned: "How to Confidently Pitch AI to Your Board (Without Getting Shot Down)"
   → Job: Feel confident + Be seen as innovative
   → Progress: From "board skepticism" → "board buy-in"
```

### Example 2: Industry-Specific Expertise

**Add healthcare-specific knowledge**:
```typescript
# HEALTHCARE-SPECIFIC CONTEXT

Current Industry Trends (2025):
- Post-pandemic telehealth plateau (68% of surge reversed)
- AI regulation uncertainty (FDA guidance pending)
- Labor shortage crisis (12% RN vacancy rate)
- Value-based care transition accelerating
- Patient consumerization (they shop for care now)

Hot Topics:
- Hybrid care models
- AI for administrative burden
- Social determinants of health
- Price transparency requirements
- Burnout and retention

Pain Points by Role:
- C-Suite: Board pressure, ROI proof, risk management
- CMO/CNO: Staff retention, quality metrics, patient satisfaction
- CFO: Margin pressure, bad debt, operational efficiency
- CIO/CTO: Legacy systems, security, vendor proliferation

Reference these in recommendations to show deep industry knowledge.
```

### Example 3: Seasonal/Timely Recommendations

```typescript
# TIMING & SEASONALITY

Current Month Considerations:
${getTimingGuidance(new Date())}

function getTimingGuidance(date: Date): string {
  const month = date.getMonth();

  if (month === 0 || month === 11) { // Jan/Dec
    return `Q4/Q1: Budget season
    - Content about ROI, business cases, vendor evaluation
    - "2025 Planning" angles
    - End-of-year urgency or new-year fresh start themes`;
  }

  if (month >= 2 && month <= 4) { // Mar-May
    return `Spring: Implementation season
    - How-to guides, implementation best practices
    - "Quick wins before summer" angles
    - Prepare for summer slowdown`;
  }

  // ... other seasons
}
```

---

## Where Everything Lives

### Main Files to Customize:

```
lib/content/recommendation-agent.ts
├── buildRecommendationPrompt()    ← Main prompt (lines 30-150)
├── analyzeSituation()             ← Situation analysis logic
├── analyzeFabric()                ← FABRIC analysis logic
└── analyzeMetrics()               ← Metrics interpretation

app/api/growth-architect/route.ts
└── temperature setting            ← Creativity level (line 82)
```

### Easy Customization Points:

1. **Frameworks**: Lines 30-60 in recommendation-agent.ts
2. **Quality Standards**: Lines 120-150
3. **Format Guidelines**: Add new section around line 100
4. **Context Rules**: In `analyzeSituation()` function
5. **Creativity**: `temperature` in API route (0.5 = conservative, 1.0 = creative)

---

## Best Practice: Keep a Changelog

Create: `lib/content/AGENT_CHANGELOG.md`

```markdown
# AI Agent Customization Log

## 2025-01-15: Added StoryBrand Framework
- What: Integrated StoryBrand 7-part framework
- Why: Client feedback wanted more narrative structure
- Impact: Recommendations now include story elements
- Files: recommendation-agent.ts (lines 45-52)

## 2025-01-10: Updated Title Formulas
- What: Added 4 new title patterns based on performance data
- Why: Original titles were too generic
- Impact: 40% increase in click-through on recommendations
- Files: recommendation-agent.ts (lines 130-145)

## 2025-01-05: Added Healthcare Trends
- What: Industry-specific context for healthcare
- Why: Recommendations felt too generic
- Impact: More timely, relevant suggestions
- Files: recommendation-agent.ts (lines 180-210)
```

---

## Quick Reference: Common Updates

| What to Update | Where | Time |
|----------------|-------|------|
| Add framework | recommendation-agent.ts, line 35 | 5 min |
| Update best practices | recommendation-agent.ts, line 130 | 2 min |
| Change creativity | growth-architect/route.ts, line 82 | 1 min |
| Add industry trends | recommendation-agent.ts, new section | 10 min |
| Format guidelines | recommendation-agent.ts, line 100 | 5 min/format |
| Quality standards | recommendation-agent.ts, line 120 | 2 min |
| A/B test prompts | Create version system | 20 min |

---

## The Answer

**Yes, extremely customizable!**

- ✅ All prompts in one readable file
- ✅ Plain text, no complex logic
- ✅ Add frameworks in 5 minutes
- ✅ Update best practices in 2 minutes
- ✅ Version control for A/B testing
- ✅ Learn from performance data
- ✅ No AI expertise required

You're not locked into anything. This is YOUR system to evolve.

---

## Want to See It In Action?

I can show you a live customization:
1. Start with current system
2. Add a new framework (your choice)
3. Test the difference
4. See how easy it is

Ready to proceed with Option B (implementation)?
