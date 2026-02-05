-- Create user_achievements table to track achievement unlocks
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  achievement_id VARCHAR(50) NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

-- Create achievement_progress table to track progress towards achievements
CREATE TABLE IF NOT EXISTS achievement_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  metric_type VARCHAR(50) NOT NULL, -- 'skills_installed', 'skills_used', 'reviews_posted', etc.
  metric_value INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, metric_type)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_achievement_progress_user ON achievement_progress(user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_achievements TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON achievement_progress TO anon, authenticated;

-- Function to update usage count when skills are used
CREATE OR REPLACE FUNCTION increment_skill_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the usage_count in installed_skills
  UPDATE installed_skills
  SET
    usage_count = COALESCE(usage_count, 0) + 1,
    last_used = NOW()
  WHERE id = NEW.id;

  -- Update achievement progress
  INSERT INTO achievement_progress (user_id, metric_type, metric_value, last_updated)
  VALUES (NEW.user_id, 'skills_used', 1, NOW())
  ON CONFLICT (user_id, metric_type)
  DO UPDATE SET
    metric_value = achievement_progress.metric_value + 1,
    last_updated = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: The trigger for skill usage should be created when we implement the skill usage tracking
-- For now, you can manually update usage_count when implementing the "use skill" feature