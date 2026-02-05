-- Grant permissions to anon and authenticated roles
-- This is needed because the tables might not have basic permissions set

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant all permissions on all tables to anon and authenticated roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Specifically grant permissions on each table
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON skills TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON installed_skills TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON reviews TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON review_replies TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON liked_skills TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON bounties TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON bounty_submissions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON skill_analytics TO anon, authenticated;

-- Grant usage on sequences (for auto-generated IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;