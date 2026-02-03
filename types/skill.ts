export type SkillCategory =
  | 'Career'
  | 'Health'
  | 'Academic'
  | 'Business'
  | 'Programming'
  | 'Marketing'
  | 'Image'
  | 'Prompt';

export type AudienceTag =
  // Students
  | 'Exam-focused students'
  | 'Coursework-heavy students'
  | 'Cram / test-prep students'
  | 'Graduate students'
  | 'Undergraduate students'
  // Researchers
  | 'PhD students'
  | 'Academic researchers'
  | 'Literature review focused users'
  | 'Data scientists'
  // Educators
  | 'Teachers'
  | 'Professors'
  | 'Teaching assistants'
  | 'Course designers'
  // Professionals
  | 'Consultants'
  | 'Analysts'
  | 'Knowledge workers'
  | 'Writers'
  | 'Engineers'
  | 'Product managers'
  // Creators
  | 'Indie builders'
  | 'Content creators'
  | 'Tool makers'
  | 'Open source contributors';

export interface Skill {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  category: SkillCategory;
  audienceTags: AudienceTag[];
  author: {
    name: string;
    avatar?: string;
    isOfficial: boolean;
  };
  stats: {
    installs: number;
    weeklyUsage: number;
    rating?: number;
  };
  version: string;
  lastUpdated: string;
  demoPrompt: string;
  examples: string[];
  features?: string[];
  requirements?: string[];
  icon?: string;
}

export interface InstalledSkill {
  skillId: string;
  installedAt: string;
  lastUsed: string;
  isEnabled: boolean;
  usageCount: number;
}

export interface UploadedSkill extends Skill {
  status: 'draft' | 'published' | 'under_review';
  publishedAt?: string;
  totalInstalls: number;
  totalUsage: number;
  weeklyActiveUsers: number;
}

export interface CreateSkillFormData {
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  category: SkillCategory;
  audienceTags: AudienceTag[];
  demoPrompt: string;
  examples: string[];
  version: string;
}
