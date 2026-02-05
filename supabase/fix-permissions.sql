-- Fix RLS permissions for development
-- This makes the tables accessible to the anon role for development

-- Drop existing policies first
DROP POLICY IF EXISTS "user_profiles_read" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_write" ON user_profiles;
DROP POLICY IF EXISTS "skills_read" ON skills;
DROP POLICY IF EXISTS "skills_write" ON skills;
DROP POLICY IF EXISTS "installed_skills_all" ON installed_skills;
DROP POLICY IF EXISTS "reviews_read" ON reviews;
DROP POLICY IF EXISTS "reviews_write" ON reviews;
DROP POLICY IF EXISTS "review_replies_read" ON review_replies;
DROP POLICY IF EXISTS "review_replies_write" ON review_replies;
DROP POLICY IF EXISTS "liked_skills_all" ON liked_skills;
DROP POLICY IF EXISTS "bounties_read" ON bounties;
DROP POLICY IF EXISTS "bounties_write" ON bounties;
DROP POLICY IF EXISTS "bounty_submissions_all" ON bounty_submissions;
DROP POLICY IF EXISTS "skill_analytics_all" ON skill_analytics;

-- Create more permissive policies for development
-- These allow the anon role to read and write data

-- User profiles: Anyone can read and write (for development)
CREATE POLICY "user_profiles_public_read" ON user_profiles
  FOR SELECT USING (true);
CREATE POLICY "user_profiles_public_insert" ON user_profiles
  FOR INSERT WITH CHECK (true);
CREATE POLICY "user_profiles_public_update" ON user_profiles
  FOR UPDATE USING (true);
CREATE POLICY "user_profiles_public_delete" ON user_profiles
  FOR DELETE USING (true);

-- Skills: Anyone can read and write (for development)
CREATE POLICY "skills_public_read" ON skills
  FOR SELECT USING (true);
CREATE POLICY "skills_public_insert" ON skills
  FOR INSERT WITH CHECK (true);
CREATE POLICY "skills_public_update" ON skills
  FOR UPDATE USING (true);
CREATE POLICY "skills_public_delete" ON skills
  FOR DELETE USING (true);

-- Installed skills: Anyone can access (for development)
CREATE POLICY "installed_skills_public_read" ON installed_skills
  FOR SELECT USING (true);
CREATE POLICY "installed_skills_public_insert" ON installed_skills
  FOR INSERT WITH CHECK (true);
CREATE POLICY "installed_skills_public_update" ON installed_skills
  FOR UPDATE USING (true);
CREATE POLICY "installed_skills_public_delete" ON installed_skills
  FOR DELETE USING (true);

-- Reviews: Anyone can access (for development)
CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT USING (true);
CREATE POLICY "reviews_public_insert" ON reviews
  FOR INSERT WITH CHECK (true);
CREATE POLICY "reviews_public_update" ON reviews
  FOR UPDATE USING (true);
CREATE POLICY "reviews_public_delete" ON reviews
  FOR DELETE USING (true);

-- Review replies: Anyone can access (for development)
CREATE POLICY "review_replies_public_read" ON review_replies
  FOR SELECT USING (true);
CREATE POLICY "review_replies_public_insert" ON review_replies
  FOR INSERT WITH CHECK (true);
CREATE POLICY "review_replies_public_update" ON review_replies
  FOR UPDATE USING (true);
CREATE POLICY "review_replies_public_delete" ON review_replies
  FOR DELETE USING (true);

-- Liked skills: Anyone can access (for development)
CREATE POLICY "liked_skills_public_read" ON liked_skills
  FOR SELECT USING (true);
CREATE POLICY "liked_skills_public_insert" ON liked_skills
  FOR INSERT WITH CHECK (true);
CREATE POLICY "liked_skills_public_update" ON liked_skills
  FOR UPDATE USING (true);
CREATE POLICY "liked_skills_public_delete" ON liked_skills
  FOR DELETE USING (true);

-- Bounties: Anyone can access (for development)
CREATE POLICY "bounties_public_read" ON bounties
  FOR SELECT USING (true);
CREATE POLICY "bounties_public_insert" ON bounties
  FOR INSERT WITH CHECK (true);
CREATE POLICY "bounties_public_update" ON bounties
  FOR UPDATE USING (true);
CREATE POLICY "bounties_public_delete" ON bounties
  FOR DELETE USING (true);

-- Bounty submissions: Anyone can access (for development)
CREATE POLICY "bounty_submissions_public_read" ON bounty_submissions
  FOR SELECT USING (true);
CREATE POLICY "bounty_submissions_public_insert" ON bounty_submissions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "bounty_submissions_public_update" ON bounty_submissions
  FOR UPDATE USING (true);
CREATE POLICY "bounty_submissions_public_delete" ON bounty_submissions
  FOR DELETE USING (true);

-- Analytics: Anyone can access (for development)
CREATE POLICY "skill_analytics_public_read" ON skill_analytics
  FOR SELECT USING (true);
CREATE POLICY "skill_analytics_public_insert" ON skill_analytics
  FOR INSERT WITH CHECK (true);
CREATE POLICY "skill_analytics_public_update" ON skill_analytics
  FOR UPDATE USING (true);
CREATE POLICY "skill_analytics_public_delete" ON skill_analytics
  FOR DELETE USING (true);