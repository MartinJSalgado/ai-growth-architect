-- Content OS Database Schema Extension
-- Add to existing AI Growth Architect schema
-- Run after supabase-schema.sql

-- Companies table (client organizations)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT,
  onboarding_id UUID REFERENCES onboarding_data(id) ON DELETE SET NULL,

  -- Company data (populated from onboarding)
  name TEXT NOT NULL,
  description TEXT,
  target_audience TEXT,
  primary_goal TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shows table (content series)
CREATE TABLE IF NOT EXISTS shows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,

  -- Show data
  name TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('podcast', 'video', 'newsletter', 'linkedin', 'blog')),
  description TEXT,

  -- Settings
  default_settings JSONB, -- Publishing defaults, brand guidelines, etc.

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Ideas table (content concepts)
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  show_id UUID REFERENCES shows(id) ON DELETE CASCADE NOT NULL,

  -- Idea data
  title TEXT NOT NULL,
  raw_brain_dump TEXT,

  -- AI-structured concept
  structured_concept JSONB, -- { title, summary, core_argument, outline[], hooks[], suggested_formats[], suggested_cta }

  -- Source tracking
  source TEXT NOT NULL CHECK (source IN ('user', 'architect')),
  status TEXT NOT NULL CHECK (status IN ('raw', 'concept', 'promoted')),

  -- Context
  context JSONB, -- { target_audience, references[], preferred_format }

  -- AI metadata
  ai_processing_log JSONB, -- Track AI iterations/edits

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Episodes table (content in production)
CREATE TABLE IF NOT EXISTS episodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID REFERENCES ideas(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  show_id UUID REFERENCES shows(id) ON DELETE CASCADE NOT NULL,

  -- Episode data
  title TEXT NOT NULL,
  description TEXT,
  format TEXT NOT NULL CHECK (format IN ('podcast', 'video', 'newsletter', 'linkedin', 'blog')),

  -- Status
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'archived')),
  progress JSONB NOT NULL DEFAULT '{}', -- { concept: bool, script: bool, record: bool, ... }

  -- Content at each stage
  concept JSONB, -- { core_argument, outline[], hooks[], suggested_cta }
  script JSONB, -- { content: string, type: 'full_script' | 'bullet_points' }
  draft JSONB, -- { content: string, word_count: number }
  recording JSONB, -- { date, file_url, recorded, uploaded, ready_for_edit }
  filming JSONB, -- { date, file_url, filmed, uploaded, ready_for_edit }
  editing JSONB, -- { edited_asset_url, notes, completed }
  design JSONB, -- { thumbnail_url, graphics_urls[], completed }
  assets JSONB, -- Array of { id, type, content, status }
  publish JSONB, -- { youtube: {published, url, date}, spotify: {...}, ... }

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content performance table (feeds back to architect)
CREATE TABLE IF NOT EXISTS content_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE NOT NULL,

  -- Platform-specific metrics
  platform TEXT NOT NULL, -- 'youtube', 'spotify', 'linkedin', etc.
  metrics JSONB NOT NULL, -- { views, engagement, conversions, etc. }

  -- Sync info
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI assistance log (track AI usage for billing/analytics)
CREATE TABLE IF NOT EXISTS ai_assistance_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT,

  -- Context
  entity_type TEXT NOT NULL, -- 'idea', 'episode', 'script', etc.
  entity_id UUID,

  -- AI operation
  operation TEXT NOT NULL, -- 'structure_idea', 'generate_script', 'refine_content', etc.
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_cost DECIMAL(10, 4),

  -- Result
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_session ON companies(session_id);
CREATE INDEX IF NOT EXISTS idx_companies_user ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_shows_company ON shows(company_id);
CREATE INDEX IF NOT EXISTS idx_ideas_show ON ideas(show_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_episodes_show ON episodes(show_id);
CREATE INDEX IF NOT EXISTS idx_episodes_status ON episodes(status);
CREATE INDEX IF NOT EXISTS idx_performance_episode ON content_performance(episode_id);
CREATE INDEX IF NOT EXISTS idx_ai_log_entity ON ai_assistance_log(entity_type, entity_id);

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shows_updated_at BEFORE UPDATE ON shows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_episodes_updated_at BEFORE UPDATE ON episodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Helpful views

-- Active episodes with progress summary
CREATE OR REPLACE VIEW active_episodes_summary AS
SELECT
  e.id,
  e.title,
  e.format,
  c.name as company_name,
  s.name as show_name,
  e.status,
  e.progress,
  e.created_at,
  e.updated_at
FROM episodes e
JOIN companies c ON e.company_id = c.id
JOIN shows s ON e.show_id = s.id
WHERE e.status = 'in_progress'
ORDER BY e.updated_at DESC;

-- Ideas awaiting promotion
CREATE OR REPLACE VIEW ideas_ready_to_promote AS
SELECT
  i.id,
  i.title,
  i.source,
  c.name as company_name,
  s.name as show_name,
  i.structured_concept->>'title' as concept_title,
  i.created_at
FROM ideas i
JOIN companies c ON i.company_id = c.id
JOIN shows s ON i.show_id = s.id
WHERE i.status = 'concept' AND i.structured_concept IS NOT NULL
ORDER BY i.created_at DESC;

-- Content performance overview
CREATE OR REPLACE VIEW content_performance_overview AS
SELECT
  e.id as episode_id,
  e.title,
  e.format,
  c.name as company_name,
  cp.platform,
  cp.metrics,
  cp.synced_at
FROM content_performance cp
JOIN episodes e ON cp.episode_id = e.id
JOIN companies c ON e.company_id = c.id
ORDER BY cp.synced_at DESC;

COMMENT ON TABLE companies IS 'Client organizations using Content OS';
COMMENT ON TABLE shows IS 'Content series (podcasts, blogs, etc.)';
COMMENT ON TABLE ideas IS 'Content concepts from users or AI Architect';
COMMENT ON TABLE episodes IS 'Content pieces in production workflow';
COMMENT ON TABLE content_performance IS 'Published content performance metrics';
COMMENT ON TABLE ai_assistance_log IS 'AI API usage tracking for billing';
