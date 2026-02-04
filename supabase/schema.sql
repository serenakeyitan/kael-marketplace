-- Enable UUID extension for generating IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create skills table
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('productivity', 'creative', 'development', 'research', 'communication', 'education', 'entertainment', 'other')),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_username TEXT NOT NULL,
  author_avatar TEXT,
  installs INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_ratings INTEGER DEFAULT 0,
  conversations INTEGER DEFAULT 0,
  weekly_active_users INTEGER DEFAULT 0,
  github_url TEXT,
  documentation TEXT,
  icon TEXT,
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create installed_skills table
CREATE TABLE installed_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  last_used TIMESTAMPTZ,
  installed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

-- Create reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_username TEXT NOT NULL,
  user_avatar TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(skill_id, user_id)
);

-- Create review_replies table
CREATE TABLE review_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_username TEXT NOT NULL,
  user_avatar TEXT,
  content TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create liked_skills table
CREATE TABLE liked_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

-- Create bounties table
CREATE TABLE bounties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  prize_pool INTEGER NOT NULL,
  track TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'upcoming')),
  deadline TIMESTAMPTZ NOT NULL,
  participant_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bounty_submissions table
CREATE TABLE bounty_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bounty_id UUID REFERENCES bounties(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bounty_id, skill_id, user_id)
);

-- Create user_profiles table (extends auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'creator')),
  total_skills_created INTEGER DEFAULT 0,
  total_installs INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create skill_analytics table for tracking usage
CREATE TABLE skill_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('install', 'uninstall', 'use', 'view')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_author ON skills(author_id);
CREATE INDEX idx_skills_created_at ON skills(created_at DESC);
CREATE INDEX idx_skills_installs ON skills(installs DESC);
CREATE INDEX idx_skills_rating ON skills(rating DESC);
CREATE INDEX idx_installed_skills_user ON installed_skills(user_id);
CREATE INDEX idx_reviews_skill ON reviews(skill_id);
CREATE INDEX idx_liked_skills_user ON liked_skills(user_id);
CREATE INDEX idx_analytics_skill ON skill_analytics(skill_id);
CREATE INDEX idx_analytics_created ON skill_analytics(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE installed_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE liked_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounty_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Skills: Anyone can read published skills
CREATE POLICY "Public skills are viewable by everyone"
  ON skills FOR SELECT
  USING (is_published = true);

-- Skills: Authors can update their own skills
CREATE POLICY "Authors can update their own skills"
  ON skills FOR UPDATE
  USING (auth.uid() = author_id);

-- Skills: Authenticated users can create skills
CREATE POLICY "Authenticated users can create skills"
  ON skills FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Installed skills: Users can manage their own installations
CREATE POLICY "Users can view their own installed skills"
  ON installed_skills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can install skills"
  ON installed_skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own installed skills"
  ON installed_skills FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can uninstall their own skills"
  ON installed_skills FOR DELETE
  USING (auth.uid() = user_id);

-- Reviews: Public read, authenticated write
CREATE POLICY "Reviews are publicly readable"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Review replies: Similar to reviews
CREATE POLICY "Review replies are publicly readable"
  ON review_replies FOR SELECT
  USING (true);

CREATE POLICY "Users can create review replies"
  ON review_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Liked skills: Users manage their own likes
CREATE POLICY "Users can view their own liked skills"
  ON liked_skills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can like skills"
  ON liked_skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike skills"
  ON liked_skills FOR DELETE
  USING (auth.uid() = user_id);

-- Bounties: Public read
CREATE POLICY "Bounties are publicly readable"
  ON bounties FOR SELECT
  USING (true);

-- Bounty submissions: Users manage their own submissions
CREATE POLICY "Users can view their own submissions"
  ON bounty_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create submissions"
  ON bounty_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User profiles: Public read, own write
CREATE POLICY "User profiles are publicly readable"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Analytics: Only insert allowed for authenticated users
CREATE POLICY "Authenticated users can track analytics"
  ON skill_analytics FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update skill ratings when reviews change
CREATE OR REPLACE FUNCTION update_skill_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE skills
  SET
    rating = (SELECT AVG(rating)::DECIMAL(2,1) FROM reviews WHERE skill_id = NEW.skill_id),
    total_ratings = (SELECT COUNT(*) FROM reviews WHERE skill_id = NEW.skill_id)
  WHERE id = NEW.skill_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating skill ratings
CREATE TRIGGER update_skill_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_skill_rating();

-- Create function to track installs
CREATE OR REPLACE FUNCTION track_skill_install()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment install count
    UPDATE skills SET installs = installs + 1 WHERE id = NEW.skill_id;
    -- Track analytics
    INSERT INTO skill_analytics (skill_id, user_id, event_type)
    VALUES (NEW.skill_id, NEW.user_id, 'install');
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement install count
    UPDATE skills SET installs = GREATEST(0, installs - 1) WHERE id = OLD.skill_id;
    -- Track analytics
    INSERT INTO skill_analytics (skill_id, user_id, event_type)
    VALUES (OLD.skill_id, OLD.user_id, 'uninstall');
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for tracking installs
CREATE TRIGGER track_skill_installation
  AFTER INSERT OR DELETE ON installed_skills
  FOR EACH ROW EXECUTE FUNCTION track_skill_install();