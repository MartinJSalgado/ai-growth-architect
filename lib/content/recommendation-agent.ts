/**
 * Recommendation Agent
 *
 * Generates strategic, context-aware content recommendations
 * for the AI Growth Architect chat interface.
 */

import type { OnboardingData } from '@/components/OnboardingFlow';

export interface CompanyContext {
  profile: {
    companyName: string;
    whatYouSell: string;
    whoYouSellTo: string;
    primaryGoal: string;
    channels: string[];
    biggestChallenge: string;
    history?: string;
  };
  fabricMaturity: {
    foundation: number;
    architecture: number;
    build: number;
    release: number;
    improve: number;
    compound: number;
  };
  brandPersonality: string[];
  ghlMetrics?: {
    pipeline?: {
      totalOpportunities: number;
      totalValue: number;
      avgValue: number;
    };
    email?: {
      totalCampaigns: number;
      avgOpenRate: number;
      avgClickRate: number;
    };
    contacts?: {
      totalContacts: number;
      recentContacts: number;
    };
  };
}

export function buildRecommendationPrompt(
  context: CompanyContext,
  userMessage: string
): string {
  const situationAnalysis = analyzeSituation(context);
  const fabricInsights = analyzeFabric(context.fabricMaturity);
  const metricsInsights = analyzeMetrics(context.ghlMetrics);

  return `You are an elite AI Growth Architect for ${context.profile.companyName}.

# COMPANY PROFILE
Company: ${context.profile.companyName}
What they sell: ${context.profile.whatYouSell}
Target audience: ${context.profile.whoYouSellTo}
Primary goal: ${context.profile.primaryGoal}
Biggest challenge: ${context.profile.biggestChallenge}
Active channels: ${context.profile.channels.join(', ')}
Brand personality: ${context.brandPersonality.join(', ')}

# CURRENT SITUATION
${situationAnalysis}

# FABRIC MATURITY ANALYSIS
${fabricInsights}

${metricsInsights ? `# REAL-TIME METRICS\n${metricsInsights}` : ''}

# YOUR MISSION
You provide strategic guidance and content recommendations that:
1. Directly address their primary goal: ${context.profile.primaryGoal}
2. Speak to their ICP: ${context.profile.whoYouSellTo}
3. Solve their challenge: ${context.profile.biggestChallenge}
4. Leverage current momentum and fill gaps

# CONTENT RECOMMENDATION FRAMEWORK

When recommending content (either proactively or when asked), follow this framework:

## 1. STRATEGIC TIMING
- Reference current metrics/situation (e.g., "Your 24 active opportunities show...")
- Explain WHY this content matters RIGHT NOW
- Connect to their current business stage

## 2. FORMAT SELECTION
Choose format based on:
- Message complexity (complex = podcast/video, simple = LinkedIn)
- Target audience behavior (executives = podcast, managers = LinkedIn)
- Available channels: ${context.profile.channels.join(', ')}

## 3. ICP ALIGNMENT
- Specify exact audience segment (not just "healthcare executives")
- Identify buyer stage: Problem Aware | Solution Aware | Product Aware | Decision Stage
- Match content depth to stage

## 4. DIFFERENTIATION
- Avoid generic topics ("Top 10 Trends")
- Use contrarian or specific angles ("Why 68% of X Fail")
- Reference specific pain points from their challenge: ${context.profile.biggestChallenge}

## 5. LEAD GENERATION POTENTIAL
- Explain HOW this drives toward: ${context.profile.primaryGoal}
- Suggest stage-appropriate CTA (not always "book a demo")
- Consider the full buyer journey

# OUTPUT FORMAT FOR CONTENT IDEAS

When recommending content, use this EXACT format for EACH recommendation:

[CONTENT_IDEA]
{
  "title": "Specific, curiosity-driven title (avoid generic like 'Top 10 Tips')",
  "format": "podcast|video|linkedin|newsletter|blog",
  "rationale": "Why this content matters NOW. Reference specific context like current metrics, market timing, or buyer behavior. 2-3 sentences. Be specific.",
  "angle": "Educational|Thought Leadership|Case Study|How-To|Contrarian",
  "targetAudience": "Exact segment (e.g., 'Healthcare CTOs evaluating AI vendors' not just 'Healthcare executives')",
  "buyerStage": "Problem Aware|Solution Aware|Product Aware|Decision Stage",
  "structuredConcept": {
    "summary": "What this content covers in 2-3 sentences. Be specific about value delivered.",
    "coreArgument": "The main thesis or contrarian take. Should be memorable and defensible.",
    "outline": [
      "Opening: Specific hook or story (not 'Introduction to topic')",
      "Point 1: Specific insight with example or data",
      "Point 2: Specific insight with example or data",
      "Point 3: Specific insight with example or data",
      "Point 4: Actionable takeaway or framework",
      "Closing: Specific CTA aligned with buyer stage"
    ],
    "hooks": [
      "Hook 1: Stat or surprising fact (e.g., '68% of healthcare AI projects fail...')",
      "Hook 2: Provocative question or contrarian take",
      "Hook 3: Specific story or scenario"
    ],
    "suggestedCta": "Stage-appropriate CTA. Problem Aware = education, Solution Aware = comparison, Decision = demo/consultation"
  },
  "expectedImpact": {
    "leadGenPotential": "High|Medium|Low",
    "reasoning": "Specific explanation of how this drives ${context.profile.primaryGoal}. Reference buyer psychology or funnel stage."
  }
}
[/CONTENT_IDEA]

# QUALITY STANDARDS (CRITICAL)

✓ SPECIFIC over generic
  ❌ "Top 10 AI Trends in Healthcare"
  ✅ "Why 68% of Healthcare AI Chatbots Fail (And the 3 That Don't)"

✓ ACTIONABLE over theoretical
  ❌ "The Importance of Patient Experience"
  ✅ "The 5-Minute Patient Intake That Saves Practices $47K/Year"

✓ CONTEXTUALIZED over general
  ❌ "You should create content about your product"
  ✅ "Your 24 pipeline opportunities show strong evaluation momentum. Address implementation fears with a podcast on 'AI Projects That Actually Work' to convert evaluators → buyers."

✓ DATA-DRIVEN over vague
  ❌ "Many people struggle with this"
  ✅ "68% of patients abandon chatbots in 30 seconds (Source: Healthcare IT News, 2024)"

✓ BRAND-ALIGNED
  Use voice: ${context.brandPersonality.join(', ')}
  ${context.brandPersonality.includes('Authentic') ? '- First-person stories, conversational' : ''}
  ${context.brandPersonality.includes('Educational') ? '- Teach and explain, cite sources' : ''}
  ${context.brandPersonality.includes('Data-driven') ? '- Use specific numbers and studies' : ''}

# USER MESSAGE
${userMessage}

# YOUR RESPONSE
${userMessage.toLowerCase().includes('content') || userMessage.toLowerCase().includes('idea') || userMessage.toLowerCase().includes('create') ?
  'Provide 2-3 high-impact content recommendations using the [CONTENT_IDEA] format above. Be strategic, specific, and reference their current situation.' :
  'Provide strategic guidance. If content creation would help achieve their goals, include 1-2 [CONTENT_IDEA] recommendations using the format above.'}

Remember: Every recommendation should feel like it was crafted specifically for ${context.profile.companyName}, not generic advice that could apply to anyone.`;
}

function analyzeSituation(context: CompanyContext): string {
  const insights: string[] = [];

  // Analyze challenge
  insights.push(`Current Challenge: ${context.profile.biggestChallenge}`);
  insights.push(`This suggests they need content that: ${inferContentNeedFromChallenge(context.profile.biggestChallenge)}`);

  // Analyze channels
  const channelInsight = analyzeChannels(context.profile.channels);
  if (channelInsight) insights.push(channelInsight);

  return insights.join('\n');
}

function inferContentNeedFromChallenge(challenge: string): string {
  const challengeLower = challenge.toLowerCase();

  if (challengeLower.includes('lead') || challengeLower.includes('pipeline')) {
    return 'Drives top-of-funnel awareness and captures qualified leads';
  }
  if (challengeLower.includes('trust') || challengeLower.includes('credibility')) {
    return 'Builds authority and demonstrates expertise';
  }
  if (challengeLower.includes('differentiat') || challengeLower.includes('stand out')) {
    return 'Showcases unique POV and contrarian insights';
  }
  if (challengeLower.includes('close') || challengeLower.includes('convert')) {
    return 'Addresses objections and builds confidence in solution';
  }
  if (challengeLower.includes('educate') || challengeLower.includes('awareness')) {
    return 'Educates market on problem and solution category';
  }

  return 'Addresses specific pain points and positions as trusted advisor';
}

function analyzeChannels(channels: string[]): string | null {
  if (channels.length === 0) return null;

  const hasLongForm = channels.some(c =>
    c.toLowerCase().includes('podcast') || c.toLowerCase().includes('video')
  );
  const hasShortForm = channels.some(c =>
    c.toLowerCase().includes('linkedin') || c.toLowerCase().includes('twitter')
  );

  if (hasLongForm && hasShortForm) {
    return 'Channel mix: Long-form for depth + short-form for reach. Recommend creating pillar content (podcast/video) and atomizing into social posts.';
  }
  if (hasLongForm) {
    return 'Long-form focused: Emphasize deep dives, stories, and comprehensive frameworks.';
  }
  if (hasShortForm) {
    return 'Short-form focused: Emphasize punchy insights, data points, and visual content.';
  }

  return null;
}

function analyzeFabric(fabric: CompanyContext['fabricMaturity']): string {
  const scores = Object.entries(fabric);
  const gaps = scores.filter(([_, score]) => score <= 2);
  const strengths = scores.filter(([_, score]) => score >= 4);

  const insights: string[] = [];

  // Overall maturity
  const avgScore = scores.reduce((sum, [_, score]) => sum + score, 0) / scores.length;
  insights.push(`Overall FABRIC maturity: ${avgScore.toFixed(1)}/5 - ${
    avgScore >= 4 ? 'Mature growth engine' :
    avgScore >= 3 ? 'Solid foundation, room to optimize' :
    avgScore >= 2 ? 'Building momentum, key gaps to fill' :
    'Early stage, focus on fundamentals'
  }`);

  // Highlight gaps
  if (gaps.length > 0) {
    insights.push(`\nKey gaps to address: ${gaps.map(([stage]) => stage).join(', ')}`);

    gaps.forEach(([stage, score]) => {
      insights.push(`  - ${stage} (${score}/5): ${getFabricGuidance(stage)}`);
    });
  }

  // Leverage strengths
  if (strengths.length > 0) {
    insights.push(`\nLeverage strengths: ${strengths.map(([stage]) => stage).join(', ')}`);
  }

  return insights.join('\n');
}

function getFabricGuidance(stage: string): string {
  const guidance: Record<string, string> = {
    foundation: 'Need foundational content: Brand positioning, value prop clarity, ICP education',
    architecture: 'Need systems content: Frameworks, processes, repeatable methodologies',
    build: 'Need production content: Show execution, case studies, how-tos',
    release: 'Need distribution content: Multi-channel strategy, repurposing, amplification',
    improve: 'Need optimization content: A/B tests, data insights, what\'s working',
    compound: 'Need growth loop content: Virality, network effects, community building'
  };

  return guidance[stage.toLowerCase()] || 'Focus on systematic content creation';
}

function analyzeMetrics(metrics?: CompanyContext['ghlMetrics']): string | null {
  if (!metrics) return null;

  const insights: string[] = [];

  // Pipeline insights
  if (metrics.pipeline) {
    const { totalOpportunities, totalValue, avgValue } = metrics.pipeline;

    insights.push(`Pipeline: ${totalOpportunities} opportunities worth $${totalValue.toLocaleString()}`);

    if (totalOpportunities > 20) {
      insights.push(`  → Strong momentum! Focus content on nurturing and conversion.`);
    } else if (totalOpportunities > 10) {
      insights.push(`  → Solid pipeline. Create content for both top-of-funnel and mid-funnel.`);
    } else {
      insights.push(`  → Need more top-of-funnel awareness content to fill pipeline.`);
    }

    if (avgValue > 10000) {
      insights.push(`  → High-value deals ($${Math.round(avgValue).toLocaleString()} avg). Create deep, consultative content.`);
    }
  }

  // Email insights
  if (metrics.email) {
    const { avgOpenRate, avgClickRate } = metrics.email;

    insights.push(`\nEmail performance: ${avgOpenRate}% open, ${avgClickRate}% click`);

    if (avgOpenRate > 30) {
      insights.push(`  → Above industry average! Subject lines and sender reputation are strong.`);
    } else if (avgOpenRate < 20) {
      insights.push(`  → Below average. Content should focus on building trust and relevance.`);
    }

    if (avgClickRate < 2) {
      insights.push(`  → Low engagement. Create more compelling, curiosity-driven content.`);
    }
  }

  // Contact insights
  if (metrics.contacts) {
    const { totalContacts, recentContacts } = metrics.contacts;
    const growthRate = (recentContacts / totalContacts) * 100;

    insights.push(`\nDatabase: ${totalContacts.toLocaleString()} contacts, ${recentContacts} new (30d)`);

    if (growthRate > 5) {
      insights.push(`  → Strong growth (${growthRate.toFixed(1)}% monthly). Scale content production.`);
    } else if (growthRate < 2) {
      insights.push(`  → Slow growth. Need more lead magnet content and distribution.`);
    }
  }

  return insights.length > 0 ? insights.join('\n') : null;
}

/**
 * Parse [CONTENT_IDEA] blocks from AI response
 */
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

export function parseContentIdeas(text: string): { ideas: ContentIdea[]; cleanText: string } {
  const regex = /\[CONTENT_IDEA\]([\s\S]*?)\[\/CONTENT_IDEA\]/g;
  const ideas: ContentIdea[] = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    try {
      const ideaJson = match[1].trim();
      const idea = JSON.parse(ideaJson);
      ideas.push(idea);
    } catch (e) {
      console.error('Failed to parse content idea:', e);
      console.error('JSON:', match[1]);
    }
  }

  // Remove the JSON blocks from display text, keeping surrounding content
  const cleanText = text.replace(regex, '').trim();

  return { ideas, cleanText };
}

/**
 * Convert OnboardingData to CompanyContext
 */
export function onboardingToContext(
  onboarding: OnboardingData,
  ghlMetrics?: any
): CompanyContext {
  return {
    profile: {
      companyName: onboarding.profile.companyName,
      whatYouSell: onboarding.profile.whatYouSell,
      whoYouSellTo: onboarding.profile.whoYouSellTo,
      primaryGoal: onboarding.profile.primaryGoal,
      channels: onboarding.profile.channels,
      biggestChallenge: onboarding.profile.biggestChallenge,
      history: onboarding.profile.history,
    },
    fabricMaturity: onboarding.brand.fabricMaturity,
    brandPersonality: onboarding.brand.personality,
    ghlMetrics,
  };
}
