-- DISABLE ROW LEVEL SECURITY FOR DEVELOPMENT
-- ⚠️ IMPORTANT: This allows any client to read/write data
-- For production, you should create proper RLS policies instead

-- Disable RLS on all tables (for development/testing)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE growth_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events DISABLE ROW LEVEL SECURITY;

-- ========================================
-- ALTERNATIVE: Enable RLS with permissive policies (more secure)
-- Uncomment the section below if you prefer to keep RLS enabled
-- ========================================

/*
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (allow all operations for now)
-- You can restrict these later based on user_id or session_id

-- Onboarding data policies
CREATE POLICY "Allow all operations on onboarding_data"
  ON onboarding_data FOR ALL
  USING (true)
  WITH CHECK (true);

-- Growth plans policies
CREATE POLICY "Allow all operations on growth_plans"
  ON growth_plans FOR ALL
  USING (true)
  WITH CHECK (true);

-- Conversations policies
CREATE POLICY "Allow all operations on conversations"
  ON conversations FOR ALL
  USING (true)
  WITH CHECK (true);

-- Analytics events policies
CREATE POLICY "Allow all operations on analytics_events"
  ON analytics_events FOR ALL
  USING (true)
  WITH CHECK (true);

-- Users policies
CREATE POLICY "Allow all operations on users"
  ON users FOR ALL
  USING (true)
  WITH CHECK (true);
*/
