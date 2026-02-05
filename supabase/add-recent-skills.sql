-- Create recent_skills table to track recently viewed skills by users
CREATE TABLE IF NOT EXISTS recent_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_recent_skills_user_viewed
  ON recent_skills(user_id, viewed_at DESC);

-- Enable RLS
ALTER TABLE recent_skills ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own recent skills"
  ON recent_skills FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own recent skills"
  ON recent_skills FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own recent skills"
  ON recent_skills FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their own recent skills"
  ON recent_skills FOR DELETE
  USING (true);

-- Grant necessary permissions
GRANT ALL ON recent_skills TO anon;
GRANT ALL ON recent_skills TO authenticated;

-- Create a function to add or update recent skill view
CREATE OR REPLACE FUNCTION add_recent_skill(
  p_user_id UUID,
  p_skill_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Insert or update the viewed_at timestamp
  INSERT INTO recent_skills (user_id, skill_id, viewed_at)
  VALUES (p_user_id, p_skill_id, NOW())
  ON CONFLICT (user_id, skill_id)
  DO UPDATE SET viewed_at = NOW();

  -- Keep only the 10 most recent skills per user
  DELETE FROM recent_skills
  WHERE user_id = p_user_id
    AND skill_id NOT IN (
      SELECT skill_id
      FROM recent_skills
      WHERE user_id = p_user_id
      ORDER BY viewed_at DESC
      LIMIT 10
    );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION add_recent_skill TO anon;
GRANT EXECUTE ON FUNCTION add_recent_skill TO authenticated;