import { NextRequest, NextResponse } from 'next/server';
import { supabase, getOrCreateSessionId } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sessionId = getOrCreateSessionId();

    console.log('🔵 Creating idea from chat recommendation...');

    // Get company for this session (from onboarding)
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .eq('session_id', sessionId)
      .limit(1);

    if (companiesError) {
      console.error('Error fetching companies:', companiesError);
    }

    let company = companies?.[0];

    if (!company) {
      console.log('⚠️ No company found, attempting to create from onboarding data...');

      // Try to get onboarding data
      const { data: onboardingData } = await supabase
        .from('onboarding_data')
        .select('*')
        .eq('session_id', sessionId)
        .eq('completed', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (onboardingData) {
        console.log('✅ Found onboarding data, creating company...');

        // Create company from onboarding data
        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert({
            session_id: sessionId,
            name: onboardingData.company_name,
            description: onboardingData.what_you_sell,
            target_audience: onboardingData.who_you_sell_to,
            primary_goal: onboardingData.primary_goal,
          })
          .select()
          .single();

        if (companyError) {
          console.error('🔴 Error creating company:', companyError);
          return NextResponse.json(
            { error: 'Failed to create company record. Please try again.' },
            { status: 500 }
          );
        }

        company = newCompany;
        console.log('✅ Company created:', company.name);
      } else {
        console.log('⚠️ No onboarding data found');
        return NextResponse.json(
          { error: 'Please complete onboarding first to create content ideas' },
          { status: 400 }
        );
      }
    }

    console.log('✅ Found company:', company.name);

    // Get or create show for this format
    const { data: shows, error: showsError } = await supabase
      .from('shows')
      .select('*')
      .eq('company_id', company.id)
      .eq('format', body.format)
      .limit(1);

    if (showsError) {
      console.error('Error fetching shows:', showsError);
    }

    let show = shows?.[0];

    if (!show) {
      console.log(`📺 Creating new ${body.format} show...`);

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
        console.error('❌ Error creating show:', showError);
        throw showError;
      }
      show = newShow;
      console.log('✅ Created show:', show.name);
    } else {
      console.log('✅ Found existing show:', show.name);
    }

    // Create the idea
    console.log('💡 Creating idea...');
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
      console.error('❌ Error creating idea:', ideaError);
      throw ideaError;
    }

    console.log('✅ Created idea:', idea.id);

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

    console.log('✅ Idea creation complete!');

    return NextResponse.json({
      success: true,
      ideaId: idea.id,
      showId: show.id,
    });
  } catch (error) {
    console.error('❌ Error in create-idea:', error);
    return NextResponse.json(
      { error: 'Failed to create idea. Please try again.' },
      { status: 500 }
    );
  }
}
