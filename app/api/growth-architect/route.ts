import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  buildRecommendationPrompt,
  onboardingToContext,
  type CompanyContext,
} from "@/lib/content/recommendation-agent";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
You are the AI Growth Architect, a B2B growth strategist for SaaS, IT services, and technical consultancies.

Your job:
1. Diagnose the state of the user's GTM system.
2. Identify the biggest constraints on growth.
3. Propose a focused set of experiments.
4. Draft concrete assets when helpful (emails, ads, landing copy, content calendar).

Use the FABRIC/Growth System model:
- Foundation – positioning, ICP, offer.
- Architecture – buyer journey, funnels, stages.
- Build – campaigns, content, channels.
- Release – launches, sequences, cadences.
- Improve – optimization, tests, feedback loops.
- Compound – assets and systems that stack over time.

Always:
- Start with a short diagnosis.
- Prioritize 3–5 high-leverage moves.
- Tie suggestions to measurable outcomes (pipeline, SQLs, ACV, cycle time).
- Write in clear, confident, slightly playful language.
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyDescription,
      goal,
      metrics,
      userMessage,
      onboardingData, // NEW: Full onboarding data for context
      ghlMetrics, // NEW: GoHighLevel metrics
    } = body;

    let prompt: string;

    // Use new context-aware recommendation engine if we have full onboarding data
    if (onboardingData) {
      const context = onboardingToContext(onboardingData, ghlMetrics);
      prompt = buildRecommendationPrompt(context, userMessage);
    } else {
      // Fallback to original simple prompt for backward compatibility
      prompt = `
COMPANY CONTEXT:
${companyDescription || "Not provided"}

CURRENT METRICS:
${metrics || "No metrics provided yet"}

GOALS:
${goal || "Not specified"}

---

USER REQUEST: ${userMessage || "Provide an initial analysis of my GTM system"}

Respond directly to the user's request while keeping their company context, metrics, and goals in mind.
Format your response with clear headings and actionable bullet points where appropriate.
`;
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o", // Using GPT-4o as a reliable model
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.8, // Slightly higher for creative content recommendations
    });

    const answer = completion.choices[0].message.content;

    return NextResponse.json({ answer });
  } catch (err: unknown) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
