-- GoHighLevel Integration Schema
-- Run this in Supabase SQL Editor after running the main schema

-- GHL OAuth Connections Table
CREATE TABLE IF NOT EXISTS ghl_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  onboarding_id UUID REFERENCES onboarding_data(id) ON DELETE CASCADE,

  -- OAuth credentials
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,

  -- GHL account info
  location_id TEXT, -- GHL Location/Sub-account ID
  location_name TEXT,
  company_id TEXT, -- GHL Company/Agency ID

  -- Scopes granted
  scopes TEXT[], -- Array of granted OAuth scopes

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GHL Metrics Cache Table
CREATE TABLE IF NOT EXISTS ghl_metrics_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ghl_connection_id UUID REFERENCES ghl_connections(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,

  -- Metric type (pipeline, email, contacts, appointments, website)
  metric_type TEXT NOT NULL,

  -- Cached data
  metric_data JSONB NOT NULL,

  -- Aggregated summary for quick access
  summary JSONB, -- Key stats like total_contacts, avg_open_rate, etc.

  -- Cache metadata
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE, -- Cache expiry

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ghl_connections_session ON ghl_connections(session_id);
CREATE INDEX IF NOT EXISTS idx_ghl_connections_active ON ghl_connections(is_active);
CREATE INDEX IF NOT EXISTS idx_ghl_metrics_connection ON ghl_metrics_cache(ghl_connection_id);
CREATE INDEX IF NOT EXISTS idx_ghl_metrics_type ON ghl_metrics_cache(metric_type);
CREATE INDEX IF NOT EXISTS idx_ghl_metrics_session ON ghl_metrics_cache(session_id);
CREATE INDEX IF NOT EXISTS idx_ghl_metrics_valid ON ghl_metrics_cache(valid_until);

-- Update trigger for ghl_connections
CREATE TRIGGER update_ghl_connections_updated_at BEFORE UPDATE ON ghl_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View: Latest GHL metrics per connection
CREATE OR REPLACE VIEW latest_ghl_metrics AS
SELECT DISTINCT ON (ghl_connection_id, metric_type)
  id,
  ghl_connection_id,
  session_id,
  metric_type,
  metric_data,
  summary,
  fetched_at,
  valid_until
FROM ghl_metrics_cache
ORDER BY ghl_connection_id, metric_type, fetched_at DESC;

-- View: Active GHL connections with latest sync info
CREATE OR REPLACE VIEW active_ghl_connections AS
SELECT
  gc.id,
  gc.session_id,
  gc.location_id,
  gc.location_name,
  gc.company_id,
  gc.is_active,
  gc.last_sync_at,
  gc.created_at,
  COUNT(DISTINCT gmc.metric_type) as cached_metric_types,
  MAX(gmc.fetched_at) as latest_metric_fetch
FROM ghl_connections gc
LEFT JOIN ghl_metrics_cache gmc ON gc.id = gmc.ghl_connection_id
WHERE gc.is_active = TRUE
GROUP BY gc.id, gc.session_id, gc.location_id, gc.location_name, gc.company_id,
         gc.is_active, gc.last_sync_at, gc.created_at;

COMMENT ON TABLE ghl_connections IS 'GoHighLevel OAuth connections and access tokens';
COMMENT ON TABLE ghl_metrics_cache IS 'Cached GHL metrics data to reduce API calls';
COMMENT ON VIEW latest_ghl_metrics IS 'Most recent metrics for each connection and type';
COMMENT ON VIEW active_ghl_connections IS 'Active GHL connections with sync status';
