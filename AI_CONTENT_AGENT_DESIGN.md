# AI Content Agent Architecture
## Designing High-Quality, Context-Aware Content Generation

---

## Overview

The AI Content Agent system has **three layers**:

```
┌─────────────────────────────────────────────┐
│   Layer 1: Recommendation Engine            │
│   (Strategic content suggestions)           │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│   Layer 2: Content Structuring              │
│   (Brain dump → Structured concept)         │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│   Layer 3: Content Production               │
│   (Script, draft, polish, assets)           │
└─────────────────────────────────────────────┘
```

Each layer needs different context, prompts, and models.

---

## Layer 1: Recommendation Engine
### "What content should we create?"

### Current Context Available
```typescript
{
  company: {
    name: "AuthenTech AI",
    whatYouSell: "AI-powered patient experience solutions",
    whoYouSellTo: "Healthcare executives and practice managers",
    primaryGoal: "Generate qualified leads for our AI platform",
    channels: ["Podcast", "LinkedIn", "Newsletter"],
    biggestChallenge: "Cutting through AI hype to show real value"
  },

  fabricMaturity: {
    foundation: 3,  // Marketing basics
    architecture: 2, // Systems/process
    build: 4,       // Content creation
    release: 2,     // Distribution
    improve: 3,     // Optimization
    compound: 1     // Growth loops
  },

  brandPersonality: ["Authentic", "Educational", "Data-driven"],

  ghlMetrics: {
    pipeline: { totalOpportunities: 24, totalValue: 340000 },
    email: { avgOpenRate: 32, avgClickRate: 4.2 },
    contacts: { totalContacts: 1847, recentContacts: 124 }
  },

  pastContent: [
    { title: "...", format: "podcast", performance: { ... } }
  ]
}
```

### Recommendation Agent Prompt Design

**File**: `lib/content/agents/recommendation-agent.ts`

```typescript
export function buildRecommendationPrompt(context: CompanyContext): string {
  return `You are a strategic content advisor for ${context.company.name}.

# YOUR MISSION
Recommend high-impact content that:
1. Aligns with their primary goal: ${context.primaryGoal}
2. Speaks to their ICP: ${context.whoYouSellTo}
3. Addresses their challenge: ${context.biggestChallenge}
4. Leverages their strengths and fills gaps in FABRIC maturity

# COMPANY CONTEXT
${formatCompanyContext(context)}

# CURRENT SITUATION ANALYSIS
${analyzeCurrentSituation(context)}

# YOUR TASK
When the user asks for content ideas, recommend 2-3 high-impact pieces.

For each recommendation, consider:
- **Timing**: Why is this content relevant RIGHT NOW?
- **Format fit**: Which format best serves this message?
- **ICP stage**: Where is the target in their buying journey?
- **Differentiation**: How does this cut through the noise?
- **Lead potential**: How does this generate qualified leads?

# OUTPUT FORMAT
For each idea, output:

[CONTENT_IDEA]
{
  "title": "Compelling, specific title (not generic)",
  "format": "podcast|video|linkedin|newsletter|blog",
  "rationale": "Why this content matters now. Reference specific context (e.g., 'Your recent pipeline growth of 24 opps shows...'). 2-3 sentences.",
  "angle": "Educational|Thought Leadership|Case Study|How-To|Contrarian",
  "targetAudience": "Specific segment (e.g., 'Healthcare CTOs evaluating AI vendors')",
  "buyerStage": "Problem Aware|Solution Aware|Product Aware|Decision Stage",
  "structuredConcept": {
    "summary": "What the content covers (2-3 sentences)",
    "coreArgument": "The main thesis or contrarian take",
    "outline": [
      "Opening hook (specific, not generic)",
      "Point 1 with specific example",
      "Point 2 with data or story",
      "Point 3 with actionable insight",
      "Call to action aligned with buyer stage"
    ],
    "hooks": [
      "Hook option 1 with specificity",
      "Hook option 2 with curiosity gap",
      "Hook option 3 with contrarian angle"
    ],
    "suggestedCta": "Specific, stage-appropriate CTA (not always 'book a demo')"
  },
  "expectedImpact": {
    "leadGenPotential": "High|Medium|Low",
    "reasoning": "Why this will generate leads (be specific)"
  }
}
[/CONTENT_IDEA]

# QUALITY STANDARDS
- ❌ Generic: "Top 10 AI Trends"
- ✅ Specific: "Why 68% of Healthcare AI Chatbots Fail (And the 3 That Don't)"

- ❌ Vague: "Improve patient experience"
- ✅ Specific: "The 5-minute patient intake that saves practices $47K/year"

- ❌ Product pitch: "Why our AI is better"
- ✅ Educational: "Hybrid Intelligence: When to use AI vs humans in patient communication"

Always cite specific data, examples, or insights from the context.`;
}

function analyzeCurrentSituation(context: CompanyContext): string {
  const insights = [];

  // Analyze pipeline
  if (context.ghlMetrics?.pipeline) {
    const { totalOpportunities, totalValue } = context.ghlMetrics.pipeline;
    insights.push(`Pipeline: ${totalOpportunities} opportunities worth $${totalValue.toLocaleString()}. ${
      totalOpportunities > 20 ? 'Strong momentum - focus on nurturing and closing' : 'Need more top-of-funnel awareness'
    }`);
  }

  // Analyze FABRIC maturity
  const fabricGaps = Object.entries(context.fabricMaturity)
    .filter(([_, score]) => score <= 2)
    .map(([stage]) => stage);

  if (fabricGaps.length > 0) {
    insights.push(`FABRIC gaps: ${fabricGaps.join(', ')} - content should address these weaknesses`);
  }

  // Analyze content history
  if (context.pastContent && context.pastContent.length > 0) {
    const topPerformer = context.pastContent[0]; // Assume sorted by performance
    insights.push(`Top content: "${topPerformer.title}" (${topPerformer.format}) - consider similar angles`);
  }

  return insights.join('\n');
}
```

### Making Recommendations Context-Aware

**Key Improvements:**

1. **Reference Specific Data**
   - ❌ "Your audience wants to know about AI"
   - ✅ "Your 24 pipeline opportunities show growing interest - now address implementation concerns"

2. **Tie to Business Goals**
   - ❌ "Create a podcast about healthcare"
   - ✅ "Podcast on AI implementation failures directly addresses your 'cutting through hype' challenge"

3. **Stage-Appropriate CTAs**
   - Problem Aware → Educational resource
   - Solution Aware → Comparison guide
   - Decision Stage → Demo/consultation

4. **Format-Message Fit**
   - Complex topic + decision-makers → Podcast (listen while commuting)
   - Quick insight + shareability → LinkedIn carousel
   - Deep dive + lead magnet → Newsletter/blog

---

## Layer 2: Content Structuring
### "User brain dump → Coherent concept"

### Input Context
```typescript
{
  brainDump: "Had a conversation with a patient yesterday who said they avoid going to the doctor because they never know what it will cost. Made me think about how billing opacity destroys trust before care even begins. Could be a whole episode about price transparency.",

  userContext: {
    company: { ... },
    show: {
      name: "The Patient Experience Lab",
      format: "podcast",
      pastEpisodes: [ ... ]
    },
    brandVoice: "Authentic, Educational, Data-driven"
  }
}
```

### Structuring Agent Prompt

**File**: `lib/content/agents/structuring-agent.ts`

```typescript
export function buildStructuringPrompt(
  brainDump: string,
  context: UserContext
): string {
  return `You are a content strategist for ${context.company.name}'s show "${context.show.name}".

# BRAND VOICE
${context.brandVoice.join(', ')}

# PAST EPISODES (for pattern matching)
${context.show.pastEpisodes.map(ep => `- "${ep.title}": ${ep.summary}`).join('\n')}

# USER'S BRAIN DUMP
${brainDump}

# YOUR TASK
Transform this brain dump into a structured ${context.show.format} concept.

Maintain the user's voice and insights while adding:
1. Structure and flow
2. Supporting examples or data points
3. Multiple hook options
4. Clear narrative arc

# QUALITY CHECKLIST
✓ Preserves user's original insight
✓ Matches brand voice (${context.brandVoice.join(', ')})
✓ Fits show format and style
✓ Has clear narrative arc
✓ Includes specific, actionable takeaways
✓ Hook creates curiosity gap

# OUTPUT
Return a JSON object:
{
  "title": "Specific, curiosity-driven title",
  "summary": "2-3 sentence summary",
  "coreArgument": "The main thesis (contrarian if possible)",
  "outline": [
    "Section 1: Opening with the patient story from brain dump",
    "Section 2: Why billing opacity is systemic (add context)",
    "Section 3: The trust equation in healthcare",
    "Section 4: What price transparency actually means",
    "Section 5: Real examples of practices doing it right",
    "Section 6: Actionable next steps for listeners"
  ],
  "hooks": [
    "Your billing practices are costing you patients before they even walk in. Here's why...",
    "What if the biggest barrier to healthcare isn't access—it's trust?",
    "I asked 100 patients why they delay care. The #1 answer shocked me."
  ],
  "suggestedFormats": ["podcast", "linkedin", "newsletter"],
  "suggestedCta": "Download our 'Price Transparency Checklist' for practice managers"
}

Focus on making this compelling and specific, not generic.`;
}
```

---

## Layer 3: Content Production
### "Concept → Finished content"

This layer has multiple specialized agents:

### 3.1 Script Generator

**File**: `lib/content/agents/script-generator.ts`

```typescript
export function buildScriptPrompt(
  concept: StructuredConcept,
  format: ContentFormat,
  context: ProductionContext
): string {
  const formatGuides = {
    podcast: PODCAST_SCRIPT_GUIDE,
    video: VIDEO_SCRIPT_GUIDE,
    linkedin: LINKEDIN_POST_GUIDE,
    newsletter: NEWSLETTER_GUIDE,
    blog: BLOG_ARTICLE_GUIDE
  };

  return `You are writing a ${format} script for ${context.company.name}.

# CONCEPT TO EXECUTE
Title: ${concept.title}
Core Argument: ${concept.coreArgument}

Outline:
${concept.outline.map((point, i) => `${i + 1}. ${point}`).join('\n')}

# BRAND VOICE GUIDELINES
${context.brandVoice.join(', ')}

Voice characteristics:
- ${context.brandVoice.includes('Authentic') ? 'Conversational, first-person stories' : ''}
- ${context.brandVoice.includes('Educational') ? 'Explain concepts clearly, cite sources' : ''}
- ${context.brandVoice.includes('Data-driven') ? 'Use specific numbers, studies, examples' : ''}

# FORMAT-SPECIFIC GUIDELINES
${formatGuides[format]}

# HOST/AUTHOR BACKGROUND
${context.hostBackground || 'Industry expert with practical experience'}

# QUALITY STANDARDS
✓ Opens with a hook that creates curiosity
✓ Each section delivers on a promise
✓ Uses specific examples, not platitudes
✓ Maintains consistent voice throughout
✓ Ends with clear, actionable CTA
✓ Natural transitions between sections
${format === 'podcast' ? '✓ Written for speaking, not reading' : ''}
${format === 'linkedin' ? '✓ Front-loads value, uses whitespace' : ''}

# OUTPUT
Write the complete ${format} script following the outline.
${format === 'podcast' ? 'Include [PAUSE], [EMPHASIS], and other speaking cues.' : ''}`;
}

const PODCAST_SCRIPT_GUIDE = `
PODCAST SCRIPT BEST PRACTICES:

Structure:
- Cold open (hook + promise)
- Intro music bed
- Episode intro
- Main content (conversational, not reading)
- Recap of key points
- Clear CTA
- Outro

Voice:
- Write how you SPEAK, not how you write
- Use contractions (you're, don't, here's)
- Short sentences for breath control
- Include natural pauses [PAUSE]
- Emphasize key phrases [EMPHASIS: "This is critical"]
- Add personality cues [LAUGH], [THOUGHTFUL PAUSE]

Example opening:
❌ "Today we will be discussing the importance of price transparency."
✅ "Okay, story time. Yesterday, a patient told me something that made me stop in my tracks. She said... [PAUSE] 'I'd rather just not know what it costs.' And I thought—wait. When did we normalize this?"
`;

const LINKEDIN_POST_GUIDE = `
LINKEDIN POST BEST PRACTICES:

Structure:
- Hook (first line makes them stop scrolling)
- Whitespace (2-line max paragraphs)
- Specific insight or story
- Takeaway or question
- CTA (if relevant)

Format:
- 1,300-1,500 characters ideal
- Bullet points or numbered lists work well
- Emojis sparingly (if on-brand)
- Tag people when relevant

Hook examples:
✅ "68% of patients abandon healthcare chatbots in 30 seconds."
✅ "I analyzed 10,000 patient conversations. This pattern shocked me:"
✅ "Your intake forms are killing trust. Here's why:"

❌ "I want to talk about patient experience today."
❌ "Healthcare is changing. Here are my thoughts."
`;

// ... similar guides for other formats
```

### 3.2 Content Refinement Agent

**File**: `lib/content/agents/refinement-agent.ts`

```typescript
export function buildRefinementPrompt(
  content: string,
  instruction: string,
  context: RefinementContext
): string {
  return `You are refining ${context.format} content for ${context.company.name}.

# CURRENT CONTENT
${content}

# REFINEMENT REQUEST
${instruction}

# BRAND VOICE
${context.brandVoice.join(', ')}

# GUIDELINES
- Preserve the core message and structure
- Make surgical improvements, don't rewrite everything
- Maintain the original voice and style
- Be specific in your changes

# COMMON REFINEMENT REQUESTS

"Make it punchier":
- Cut 20-30% of words
- Replace weak verbs with strong ones
- Remove hedging language ("maybe", "perhaps", "kind of")
- Front-load value in every sentence

"Add more personality":
- Include specific stories or examples
- Use conversational asides
- Add sensory details
- Show don't tell

"Make it more data-driven":
- Add specific statistics (cite sources)
- Include case study numbers
- Quantify outcomes
- Compare before/after

"Simplify this":
- Replace jargon with plain language
- Use analogies for complex concepts
- Break long sentences into shorter ones
- Add explanatory examples

# OUTPUT
Return the refined content, making only the requested changes while maintaining quality.`;
}
```

---

## Advanced Features

### 1. Brand Voice Library

Store examples of company's best content to train the AI:

**Database Table**: `brand_voice_library`

```sql
CREATE TABLE brand_voice_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),

  content_type TEXT, -- 'writing_sample', 'approved_script', 'brand_guideline'
  title TEXT,
  content TEXT,

  characteristics JSONB, -- { tone: 'conversational', perspective: 'first-person', ... }
  quality_score INTEGER, -- 1-10, based on performance

  created_at TIMESTAMP DEFAULT NOW()
);
```

**Usage in Prompts**:
```typescript
const voiceExamples = await supabase
  .from('brand_voice_library')
  .select('*')
  .eq('company_id', companyId)
  .order('quality_score', { ascending: false })
  .limit(3);

const prompt = `
# BRAND VOICE EXAMPLES (your best work)

${voiceExamples.map(ex => `
Example: "${ex.title}"
${ex.content.substring(0, 500)}...

Why this works: ${ex.characteristics.notes}
`).join('\n\n')}

Match this style in your output.
`;
```

### 2. Performance-Based Learning

Track which AI-generated content performs best:

```typescript
// After content is published and has performance data
const updatePromptWeights = async (episodeId: string) => {
  const episode = await getEpisode(episodeId);
  const performance = await getPerformanceMetrics(episodeId);

  if (performance.engagement > threshold) {
    // This content performed well
    // Store the concept/approach in high-performing examples
    await supabase.from('high_performing_content').insert({
      company_id: episode.company_id,
      format: episode.format,
      concept: episode.concept,
      hooks_used: episode.concept.hooks,
      performance_score: calculateScore(performance),
      what_worked: analyzeWhatWorked(episode, performance)
    });
  }
};

// Use in future prompts
const topPerformers = await getTopPerformingContent(companyId, format);
prompt += `\n# YOUR BEST-PERFORMING ${format.toUpperCase()} CONTENT\n`;
prompt += topPerformers.map(p =>
  `"${p.concept.title}"\n- Hook used: "${p.hooks_used[0]}"\n- What worked: ${p.what_worked}`
).join('\n\n');
```

### 3. Multi-Model Strategy

Use different models for different tasks:

```typescript
const AI_MODEL_STRATEGY = {
  recommendation: {
    model: 'claude-3-5-sonnet-20241022', // Best reasoning
    temperature: 0.7,
    max_tokens: 2000
  },

  structuring: {
    model: 'gpt-4-turbo', // Fast, good structure
    temperature: 0.8,
    max_tokens: 1500
  },

  scriptWriting: {
    model: 'claude-3-5-sonnet-20241022', // Best creative writing
    temperature: 0.9,
    max_tokens: 4000
  },

  refinement: {
    model: 'gpt-4-turbo', // Surgical edits
    temperature: 0.5,
    max_tokens: 3000
  },

  hooks: {
    model: 'claude-3-5-sonnet-20241022', // Creative
    temperature: 1.0,
    max_tokens: 500
  }
};
```

### 4. Iterative Refinement Flow

Allow users to guide the AI:

```typescript
// In ScriptTab component
const [refinementHistory, setRefinementHistory] = useState([]);

const handleRefine = async (instruction: string) => {
  const refined = await fetch('/api/content/ai-assist', {
    method: 'POST',
    body: JSON.stringify({
      operation: 'refine_content',
      data: {
        content: currentScript,
        instruction,
        previousRefinements: refinementHistory,
        context: { format, brandVoice, ... }
      }
    })
  });

  setRefinementHistory([...refinementHistory, {
    instruction,
    result: refined,
    timestamp: Date.now()
  }]);
};

// Quick refinement buttons
<div className="flex gap-2">
  <button onClick={() => handleRefine("Make this 30% punchier")}>
    ⚡ Punch it up
  </button>
  <button onClick={() => handleRefine("Add more specific examples")}>
    📊 Add examples
  </button>
  <button onClick={() => handleRefine("Simplify for non-technical audience")}>
    🎯 Simplify
  </button>
  <button onClick={() => handleRefine("Make the hook more compelling")}>
    🎣 Better hook
  </button>
</div>
```

---

## Customization Interface

### Settings Panel for AI Behavior

**Component**: `components/content/AISettings.tsx`

```typescript
export function AISettings({ companyId }: { companyId: string }) {
  const [settings, setSettings] = useState({
    creativity: 0.8,        // Temperature 0-1
    lengthPreference: 'medium', // short, medium, long
    toneGuidance: 'conversational',
    includeDataPoints: true,
    preferContrarian: false,
    citationStyle: 'inline',
    exampleFrequency: 'high'
  });

  return (
    <div className="bg-white rounded-lg p-6">
      <h3>AI Content Generation Settings</h3>

      <div className="space-y-4">
        <div>
          <label>Creativity Level</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.creativity}
            onChange={(e) => setSettings({...settings, creativity: e.target.value})}
          />
          <p className="text-sm text-slate-600">
            {settings.creativity < 0.5 ? 'Conservative, data-focused' :
             settings.creativity < 0.8 ? 'Balanced creativity' :
             'Highly creative, unique angles'}
          </p>
        </div>

        <div>
          <label>Default Content Length</label>
          <select value={settings.lengthPreference}>
            <option value="short">Short (5-7 min podcast, 800 words)</option>
            <option value="medium">Medium (15-20 min, 1500 words)</option>
            <option value="long">Long (30+ min, 2500+ words)</option>
          </select>
        </div>

        {/* More settings... */}
      </div>

      <button onClick={saveSettings}>
        Save AI Preferences
      </button>
    </div>
  );
}
```

---

## Testing & Quality Assurance

### AI Output Evaluation

```typescript
const evaluateAIOutput = (output: any, criteria: QualityCriteria) => {
  const checks = {
    specificity: checkSpecificity(output), // Not generic?
    brandAlignment: checkBrandVoice(output, criteria.brandVoice),
    structuralIntegrity: checkStructure(output, criteria.format),
    actionability: checkActionable(output), // Clear takeaways?
    hookQuality: evaluateHooks(output.hooks),
    ctaRelevance: evaluateCTA(output.suggestedCta, criteria.buyerStage)
  };

  const overallScore = Object.values(checks).reduce((a, b) => a + b) / Object.keys(checks).length;

  if (overallScore < 0.7) {
    // Regenerate with additional guidance
    return regenerateWithFeedback(output, checks);
  }

  return output;
};

function checkSpecificity(output: any): number {
  const genericPhrases = [
    'in today\'s world',
    'it\'s important to',
    'best practices',
    'cutting edge',
    'game changer'
  ];

  const genericCount = genericPhrases.filter(phrase =>
    output.text.toLowerCase().includes(phrase)
  ).length;

  return Math.max(0, 1 - (genericCount * 0.2));
}
```

---

## Next Steps

Would you like me to:

1. **Implement the Recommendation Engine** with context-aware prompts?
2. **Create the brand voice learning system** that improves over time?
3. **Build the multi-model strategy** with different AIs for different tasks?
4. **Design the user interface** for AI settings and refinement?
5. **Set up the evaluation system** to ensure quality outputs?

Let me know which aspect you want to focus on first!
