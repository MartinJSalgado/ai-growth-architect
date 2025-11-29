import { NextResponse } from "next/server";
import OpenAI from "openai";

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
    const { companyDescription, goal, metrics } = body;

    const userPrompt = `
User company description:
${companyDescription || "(not provided)"}

Campaign / metrics context:
${metrics || "(not provided)"}

Goal:
${goal || "(not provided)"}

Task:
1. Give a concise diagnosis of performance.
2. Identify the 3 biggest growth constraints.
3. Recommend 3–5 specific experiments for the next 30 days.
4. Draft example assets (subject lines, hooks, or short copy) where helpful.

Format the response with clear markdown headings and bullet points.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o", // Using GPT-4o as a reliable model
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
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
