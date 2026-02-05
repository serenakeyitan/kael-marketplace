-- Seed data for Kael Marketplace
-- This script creates sample data for development and testing

-- First, create a test user (you'll need to replace this with actual user IDs from Supabase Auth)
-- For now, we'll use a placeholder UUID
DO $$
DECLARE
  test_user_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  test_user2_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
  test_user3_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
BEGIN

-- Insert test user profiles (these would normally be created when users sign up)
INSERT INTO user_profiles (id, username, display_name, avatar_url, bio, role) VALUES
  (test_user_id, 'alexchen', 'Alex Chen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', 'AI researcher and developer', 'creator'),
  (test_user2_id, 'sarahkim', 'Sarah Kim', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', 'Product designer and creative coder', 'creator'),
  (test_user3_id, 'mikejohnson', 'Mike Johnson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', 'Full-stack developer', 'user')
ON CONFLICT (id) DO NOTHING;

-- Insert sample skills
INSERT INTO skills (slug, name, description, category, author_id, author_name, author_username, author_avatar, installs, rating, total_ratings, conversations, weekly_active_users, github_url, documentation, tags) VALUES
  -- Productivity Skills
  ('task-master-pro', 'Task Master Pro', 'Advanced task management with AI-powered prioritization and smart scheduling', 'productivity', test_user_id, 'Alex Chen', 'alexchen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', 15234, 4.8, 892, 45678, 3421, 'https://github.com/alexchen/task-master-pro', '# Task Master Pro\n\nAn advanced task management system that uses AI to help you prioritize and schedule your work efficiently.\n\n## Features\n- Smart prioritization\n- AI-powered scheduling\n- Calendar integration\n- Team collaboration\n\n## Usage\nSimply describe your tasks and let the AI organize them for you!', ARRAY['productivity', 'tasks', 'ai', 'scheduling']),

  ('smart-notes', 'Smart Notes', 'Intelligent note-taking assistant with auto-organization and cross-referencing', 'productivity', test_user2_id, 'Sarah Kim', 'sarahkim', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', 8932, 4.6, 567, 23456, 2103, 'https://github.com/sarahkim/smart-notes', '# Smart Notes\n\nYour intelligent note-taking companion.\n\n## Key Features\n- Auto-organization\n- Smart tagging\n- Cross-referencing\n- Markdown support', ARRAY['notes', 'organization', 'markdown', 'productivity']),

  -- Creative Skills
  ('ai-art-studio', 'AI Art Studio', 'Generate stunning artwork with advanced AI models and custom styles', 'creative', test_user2_id, 'Sarah Kim', 'sarahkim', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', 28451, 4.9, 1823, 89234, 6782, 'https://github.com/sarahkim/ai-art-studio', '# AI Art Studio\n\nCreate beautiful artwork with AI.\n\n## Capabilities\n- Multiple art styles\n- Custom training\n- High resolution output\n- Batch processing', ARRAY['art', 'ai', 'creative', 'design']),

  ('story-weaver', 'Story Weaver', 'Creative writing assistant with plot generation and character development', 'creative', test_user_id, 'Alex Chen', 'alexchen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', 12087, 4.7, 743, 34567, 3421, NULL, '# Story Weaver\n\nYour creative writing companion.', ARRAY['writing', 'creative', 'storytelling']),

  -- Development Skills
  ('code-reviewer-pro', 'Code Reviewer Pro', 'Automated code review with security scanning and best practice suggestions', 'development', test_user_id, 'Alex Chen', 'alexchen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', 34521, 4.9, 2104, 98234, 8234, 'https://github.com/alexchen/code-reviewer', '# Code Reviewer Pro\n\nAutomated code review and analysis.\n\n## Supported Languages\n- JavaScript/TypeScript\n- Python\n- Java\n- Go\n- Rust', ARRAY['code', 'review', 'development', 'security']),

  ('api-doc-gen', 'API Doc Generator', 'Automatically generate comprehensive API documentation from code', 'development', test_user3_id, 'Mike Johnson', 'mikejohnson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', 19832, 4.5, 982, 56234, 4321, NULL, '# API Doc Generator\n\nGenerate beautiful API documentation automatically.', ARRAY['api', 'documentation', 'development']),

  -- Research Skills
  ('research-assistant', 'Research Assistant', 'Academic research helper with citation management and paper summarization', 'research', test_user_id, 'Alex Chen', 'alexchen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', 23456, 4.8, 1432, 67890, 5678, 'https://github.com/alexchen/research-assistant', '# Research Assistant\n\nYour academic research companion.\n\n## Features\n- Paper summarization\n- Citation management\n- Literature review\n- Research synthesis', ARRAY['research', 'academic', 'citations', 'papers']),

  ('data-analyzer', 'Data Analyzer', 'Advanced data analysis with visualization and statistical insights', 'research', test_user2_id, 'Sarah Kim', 'sarahkim', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', 17654, 4.6, 876, 45678, 3987, NULL, '# Data Analyzer\n\nPowerful data analysis and visualization.', ARRAY['data', 'analysis', 'statistics', 'visualization']),

  -- Communication Skills
  ('email-composer', 'Email Composer', 'Professional email writing with tone adjustment and templates', 'communication', test_user3_id, 'Mike Johnson', 'mikejohnson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', 41234, 4.7, 2341, 123456, 9876, NULL, '# Email Composer\n\nWrite perfect emails every time.\n\n## Features\n- Tone adjustment\n- Professional templates\n- Grammar checking\n- Follow-up reminders', ARRAY['email', 'writing', 'communication', 'professional']),

  ('language-translator', 'Language Translator Pro', 'Advanced translation with context awareness and cultural adaptation', 'communication', test_user2_id, 'Sarah Kim', 'sarahkim', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', 36789, 4.8, 1987, 98765, 7654, 'https://github.com/sarahkim/translator-pro', '# Language Translator Pro\n\nAdvanced translation with cultural context.', ARRAY['translation', 'language', 'communication', 'international']);

-- Insert sample reviews
INSERT INTO reviews (skill_id, user_id, user_name, user_username, user_avatar, rating, content, helpful_count) VALUES
  ((SELECT id FROM skills WHERE slug = 'task-master-pro'), test_user2_id, 'Sarah Kim', 'sarahkim', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', 5, 'This has completely transformed how I manage my daily tasks. The AI prioritization is spot-on and saves me hours each week!', 42),
  ((SELECT id FROM skills WHERE slug = 'task-master-pro'), test_user3_id, 'Mike Johnson', 'mikejohnson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', 4, 'Great tool overall. The scheduling feature could use some improvements for recurring tasks, but the AI suggestions are very helpful.', 18),
  ((SELECT id FROM skills WHERE slug = 'ai-art-studio'), test_user_id, 'Alex Chen', 'alexchen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', 5, 'Incredible quality and variety of art styles. The custom training feature lets me create exactly what I envision. Highly recommended!', 67),
  ((SELECT id FROM skills WHERE slug = 'code-reviewer-pro'), test_user2_id, 'Sarah Kim', 'sarahkim', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', 5, 'Catches issues I would have missed. The security scanning alone is worth it. Has saved our team from several potential vulnerabilities.', 89),
  ((SELECT id FROM skills WHERE slug = 'email-composer'), test_user_id, 'Alex Chen', 'alexchen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', 4, 'Very helpful for professional communication. The tone adjustment feature is particularly useful when writing to different audiences.', 31);

-- Insert sample installed skills (simulating users having installed certain skills)
INSERT INTO installed_skills (user_id, skill_id, enabled, last_used) VALUES
  (test_user_id, (SELECT id FROM skills WHERE slug = 'ai-art-studio'), true, NOW() - INTERVAL '2 hours'),
  (test_user_id, (SELECT id FROM skills WHERE slug = 'email-composer'), true, NOW() - INTERVAL '1 day'),
  (test_user2_id, (SELECT id FROM skills WHERE slug = 'task-master-pro'), true, NOW() - INTERVAL '3 hours'),
  (test_user2_id, (SELECT id FROM skills WHERE slug = 'code-reviewer-pro'), false, NOW() - INTERVAL '2 days'),
  (test_user3_id, (SELECT id FROM skills WHERE slug = 'research-assistant'), true, NOW() - INTERVAL '5 hours');

-- Insert sample liked skills
INSERT INTO liked_skills (user_id, skill_id) VALUES
  (test_user_id, (SELECT id FROM skills WHERE slug = 'ai-art-studio')),
  (test_user_id, (SELECT id FROM skills WHERE slug = 'code-reviewer-pro')),
  (test_user2_id, (SELECT id FROM skills WHERE slug = 'task-master-pro')),
  (test_user3_id, (SELECT id FROM skills WHERE slug = 'email-composer'));

-- Insert sample bounties
INSERT INTO bounties (title, description, prize_pool, track, status, deadline) VALUES
  ('AI Research Challenge', 'Create innovative AI research tools that advance the field', 10000, 'AI Research', 'active', NOW() + INTERVAL '30 days'),
  ('Code Generation Sprint', 'Build skills that generate high-quality, production-ready code', 7500, 'Code Generation', 'active', NOW() + INTERVAL '21 days'),
  ('Creative Content Contest', 'Develop skills for creative content generation and artistic expression', 5000, 'Creative Content', 'upcoming', NOW() + INTERVAL '45 days');

-- Insert sample bounty submissions
INSERT INTO bounty_submissions (bounty_id, skill_id, user_id) VALUES
  ((SELECT id FROM bounties WHERE title = 'AI Research Challenge'), (SELECT id FROM skills WHERE slug = 'research-assistant'), test_user_id),
  ((SELECT id FROM bounties WHERE title = 'Code Generation Sprint'), (SELECT id FROM skills WHERE slug = 'code-reviewer-pro'), test_user_id);

END $$;