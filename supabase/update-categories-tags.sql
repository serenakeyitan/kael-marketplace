-- Update the categories to match frontend expectations

-- First, we need to update the CHECK constraint on the skills table
ALTER TABLE skills DROP CONSTRAINT IF EXISTS skills_category_check;
ALTER TABLE skills ADD CONSTRAINT skills_category_check
  CHECK (category IN ('Career', 'Health', 'Academic', 'Business', 'Programming', 'Marketing', 'Image', 'Prompt'));

-- Now update existing skills to use the correct categories and audience tags
UPDATE skills SET
  category = 'Business',
  tags = ARRAY['Knowledge workers', 'Product managers', 'Consultants']
WHERE slug = 'task-master-pro';

UPDATE skills SET
  category = 'Academic',
  tags = ARRAY['Graduate students', 'Academic researchers', 'PhD students']
WHERE slug = 'smart-notes';

UPDATE skills SET
  category = 'Image',
  tags = ARRAY['Content creators', 'Tool makers', 'Indie builders']
WHERE slug = 'ai-art-studio';

UPDATE skills SET
  category = 'Prompt',
  tags = ARRAY['Writers', 'Content creators']
WHERE slug = 'story-weaver';

UPDATE skills SET
  category = 'Programming',
  tags = ARRAY['Engineers', 'Open source contributors', 'Data scientists']
WHERE slug = 'code-reviewer-pro';

UPDATE skills SET
  category = 'Programming',
  tags = ARRAY['Engineers', 'Product managers', 'Knowledge workers']
WHERE slug = 'api-doc-gen';

UPDATE skills SET
  category = 'Academic',
  tags = ARRAY['PhD students', 'Academic researchers', 'Graduate students', 'Literature review focused users']
WHERE slug = 'research-assistant';

UPDATE skills SET
  category = 'Business',
  tags = ARRAY['Data scientists', 'Analysts', 'Consultants']
WHERE slug = 'data-analyzer';

UPDATE skills SET
  category = 'Career',
  tags = ARRAY['Knowledge workers', 'Consultants', 'Product managers']
WHERE slug = 'email-composer';

UPDATE skills SET
  category = 'Marketing',
  tags = ARRAY['Content creators', 'Writers', 'Consultants']
WHERE slug = 'language-translator';

-- Add more diverse skills to cover all categories
INSERT INTO skills (slug, name, description, category, author_id, author_name, author_username, author_avatar, installs, rating, total_ratings, conversations, weekly_active_users, github_url, documentation, tags) VALUES
  -- Health category skill
  ('health-tracker', 'Health & Wellness Tracker', 'Track your health metrics, medications, and wellness goals', 'Health', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Sarah Kim', 'sarahkim', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', 8234, 4.7, 432, 18923, 1876, NULL, E'# Health & Wellness Tracker\n\nComprehensive health monitoring and goal tracking.\n\n## Features\n- Symptom tracking\n- Medication reminders\n- Wellness goals\n- Health insights', ARRAY['Knowledge workers', 'Graduate students']),

  -- Prompt category skill
  ('prompt-engineer', 'Prompt Engineering Assistant', 'Optimize and test your AI prompts for better results', 'Prompt', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Alex Chen', 'alexchen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', 12456, 4.8, 678, 34567, 2890, 'https://github.com/alexchen/prompt-engineer', E'# Prompt Engineering Assistant\n\nMaster the art of prompt engineering.\n\n## Capabilities\n- Prompt optimization\n- A/B testing\n- Template library\n- Performance metrics', ARRAY['Content creators', 'Writers', 'Engineers', 'Product managers'])
ON CONFLICT (slug) DO NOTHING;