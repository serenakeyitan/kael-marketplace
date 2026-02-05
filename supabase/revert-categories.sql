-- Revert the categories back to the original lowercase format
-- This matches what the frontend now expects

-- Update the CHECK constraint on the skills table to match the original categories
ALTER TABLE skills DROP CONSTRAINT IF EXISTS skills_category_check;
ALTER TABLE skills ADD CONSTRAINT skills_category_check
  CHECK (category IN ('productivity', 'creative', 'development', 'research', 'communication', 'education', 'entertainment', 'other'));

-- If you ran the previous update script, revert the categories back:
UPDATE skills SET category = 'productivity' WHERE category = 'Business' AND slug IN ('task-master-pro', 'data-analyzer');
UPDATE skills SET category = 'productivity' WHERE category = 'Academic' AND slug = 'smart-notes';
UPDATE skills SET category = 'creative' WHERE category = 'Image' AND slug = 'ai-art-studio';
UPDATE skills SET category = 'creative' WHERE category = 'Prompt' AND slug IN ('story-weaver', 'prompt-engineer');
UPDATE skills SET category = 'development' WHERE category = 'Programming' AND slug IN ('code-reviewer-pro', 'api-doc-gen');
UPDATE skills SET category = 'research' WHERE category = 'Academic' AND slug = 'research-assistant';
UPDATE skills SET category = 'communication' WHERE category = 'Career' AND slug = 'email-composer';
UPDATE skills SET category = 'communication' WHERE category = 'Marketing' AND slug = 'language-translator';
UPDATE skills SET category = 'education' WHERE category = 'Health' AND slug = 'health-tracker';

-- Note: The audience tags can remain as they are - those are fine