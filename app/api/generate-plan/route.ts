import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profile, brand } = body;

    // Build comprehensive prompt for plan generation
    const planPrompt = `
You are the AI Growth Architect generating a comprehensive GTM growth plan.

COMPANY PROFILE:
- Name: ${profile.companyName}
- What they sell: ${profile.whatYouSell}
- Who they sell to: ${profile.whoYouSellTo}
- Primary goal: ${profile.primaryGoal}
- Channels: ${profile.channels.join(", ")}
- Biggest challenge: ${profile.biggestChallenge}
${profile.history ? `- Context: ${profile.history}` : ""}

BRAND & PREFERENCES:
- Personality: ${brand.personality.join(", ")}
- Layout preference: ${brand.layoutPreference}
- FABRIC maturity levels:
  ${Object.entries(brand.fabricMaturity).map(([stage, level]) => `  - ${stage}: ${level}/5`).join("\n")}

SECTIONS TO GENERATE:
${brand.selectedSections.map((s: string) => `- ${s}`).join("\n")}

TASK:
Generate a comprehensive Growth Plan that includes:

1. **Summary**: A 2-3 paragraph overview of the company's GTM situation, their main opportunities, and the recommended growth direction.

2. For each selected section, provide specific, actionable content:
   - **ICP**: Define their ideal customer profile with demographics, psychographics, and decision criteria
   - **Positioning**: Clear positioning statement and differentiation
   - **Messaging**: Key value propositions and narrative hooks
   - **Content Strategy**: Content types, topics, and distribution approach
   - **Campaign Plan**: 3-5 campaign ideas with themes and tactics
   - **Funnel Map**: Stage-by-stage funnel breakdown with conversion points
   - **KPIs**: 5-7 key metrics to track with targets
   - **Experiment Roadmap**: 3-5 experiments to run in the next 30-60 days
   - **Automation**: Automation opportunities to increase efficiency

Use a ${brand.layoutPreference} style and ${brand.personality.join(", ")} tone.
Be specific, actionable, and tailored to their business.
Format with clear headings and bullet points.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert B2B GTM strategist creating comprehensive, actionable growth plans. Always be specific, tactical, and tailored to the company's unique situation.",
        },
        {
          role: "user",
          content: planPrompt,
        },
      ],
      temperature: 0.7,
    });

    const generatedContent = completion.choices[0].message.content || "";

    // Parse the generated content into sections
    const plan = {
      summary: extractSection(generatedContent, "Summary") || "Growth plan generated based on your profile.",
      sections: parseSections(generatedContent, brand.selectedSections),
    };

    return NextResponse.json({ plan });
  } catch (err: unknown) {
    console.error("Error generating plan:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to generate plan";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Helper function to extract a section from the generated content
function extractSection(content: string, sectionName: string): string | null {
  const regex = new RegExp(`##?\\s*${sectionName}[:\\s]*([\\s\\S]*?)(?=##|$)`, "i");
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

// Helper function to parse all sections
function parseSections(content: string, requestedSections: string[]): Record<string, string> {
  const sectionMap: Record<string, string> = {
    icp: "ICP|Ideal Customer Profile",
    positioning: "Positioning",
    messaging: "Messaging",
    contentStrategy: "Content Strategy",
    campaignPlan: "Campaign Plan",
    funnelMap: "Funnel Map",
    kpis: "KPIs|Key Metrics",
    experimentRoadmap: "Experiment Roadmap",
    automation: "Automation",
  };

  const sections: Record<string, string> = {};

  requestedSections.forEach((section) => {
    const sectionPattern = sectionMap[section];
    if (sectionPattern) {
      const extracted = extractSection(content, sectionPattern);
      if (extracted) {
        sections[section] = extracted;
      }
    }
  });

  return sections;
}
