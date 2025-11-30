-- AI Growth Architect Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for when you add authentication later)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Onboarding data table
CREATE TABLE IF NOT EXISTS onboarding_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL, -- For anonymous users before auth

  -- Profile data
  company_name TEXT,
  what_you_sell TEXT,
  who_you_sell_to TEXT,
  primary_goal TEXT,
  channels TEXT[], -- Array of strings
  biggest_challenge TEXT,
  history TEXT,

  -- Brand settings
  brand_personality TEXT[], -- Array of strings
  fabric_maturity JSONB, -- Store as JSON object
  selected_sections TEXT[], -- Array of strings
  layout_preference TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed BOOLEAN DEFAULT FALSE
);

-- Growth plans table
CREATE TABLE IF NOT EXISTS growth_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  onboarding_id UUID REFERENCES onboarding_data(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT,

  -- Plan content
  summary TEXT,
  sections JSONB, -- Store all sections as JSON

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  regenerated_count INTEGER DEFAULT 0
);

-- Conversations table (chat history)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  onboarding_id UUID REFERENCES onboarding_data(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT,

  -- Conversation data
  messages JSONB, -- Array of message objects

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics events table (track user actions)
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT,
  onboarding_id UUID REFERENCES onboarding_data(id) ON DELETE CASCADE,

  -- Event data
  event_type TEXT NOT NULL, -- e.g., 'quick_action_clicked', 'insight_clicked', 'plan_regenerated'
  event_data JSONB, -- Additional event metadata

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_onboarding_session ON onboarding_data(session_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_created ON onboarding_data(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_plans_onboarding ON growth_plans(onboarding_id);
CREATE INDEX IF NOT EXISTS idx_conversations_onboarding ON conversations(onboarding_id);
CREATE INDEX IF NOT EXISTS idx_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created ON analytics_events(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_updated_at BEFORE UPDATE ON onboarding_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Helpful views for analytics

-- View: Recent onboardings with summary
CREATE OR REPLACE VIEW recent_onboardings AS
SELECT
  id,
  company_name,
  primary_goal,
  biggest_challenge,
  channels,
  brand_personality,
  layout_preference,
  created_at,
  completed
FROM onboarding_data
ORDER BY created_at DESC;

-- View: Pain point analysis
CREATE OR REPLACE VIEW pain_point_analysis AS
SELECT
  biggest_challenge,
  COUNT(*) as count,
  ARRAY_AGG(DISTINCT company_name) as companies
FROM onboarding_data
WHERE biggest_challenge IS NOT NULL AND biggest_challenge != ''
GROUP BY biggest_challenge
ORDER BY count DESC;

-- View: Channel usage
CREATE OR REPLACE VIEW channel_usage AS
SELECT
  UNNEST(channels) as channel,
  COUNT(*) as count
FROM onboarding_data
WHERE channels IS NOT NULL
GROUP BY channel
ORDER BY count DESC;

-- View: FABRIC maturity overview
CREATE OR REPLACE VIEW fabric_maturity_stats AS
SELECT
  company_name,
  (fabric_maturity->>'foundation')::int as foundation,
  (fabric_maturity->>'architecture')::int as architecture,
  (fabric_maturity->>'build')::int as build,
  (fabric_maturity->>'release')::int as release,
  (fabric_maturity->>'improve')::int as improve,
  (fabric_maturity->>'compound')::int as compound,
  created_at
FROM onboarding_data
WHERE fabric_maturity IS NOT NULL
ORDER BY created_at DESC;

COMMENT ON TABLE users IS 'User accounts (for future authentication)';
COMMENT ON TABLE onboarding_data IS 'User onboarding responses and preferences';
COMMENT ON TABLE growth_plans IS 'AI-generated growth plans';
COMMENT ON TABLE conversations IS 'Chat conversation history';
COMMENT ON TABLE analytics_events IS 'User behavior tracking events';
