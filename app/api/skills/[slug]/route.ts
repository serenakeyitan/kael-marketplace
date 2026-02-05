import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  try {
    // Fetch skill by slug
    const { data: skill, error: skillError } = await supabase
      .from('skills')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (skillError || !skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    // Fetch reviews count for this skill
    const { count: reviewsCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('skill_id', skill.id);

    // Get related skills (same category or with overlapping tags)
    const { data: relatedSkills } = await supabase
      .from('skills')
      .select('*')
      .eq('is_published', true)
      .neq('id', skill.id)
      .or(`category.eq.${skill.category}`)
      .limit(4);

    // Transform skill to match frontend format
    const transformedSkill = {
      id: skill.id,
      slug: skill.slug,
      name: skill.name,
      shortDescription: skill.description,
      longDescription: skill.documentation || skill.description,
      category: skill.category,
      audienceTags: skill.tags || [],
      author: {
        name: skill.author_name,
        username: skill.author_username,
        avatar: skill.author_avatar,
        isOfficial: false,
      },
      stats: {
        installs: skill.installs || 0,
        totalConversations: skill.conversations || 0,
        rating: skill.rating || 0,
        totalRatings: skill.total_ratings || 0,
        weeklyActiveUsers: skill.weekly_active_users || 0,
        reviewsCount: reviewsCount || 0,
      },
      version: '1.0.0', // We don't have version in DB yet
      lastUpdated: skill.updated_at || skill.created_at,
      githubUrl: skill.github_url,
      icon: skill.icon,
      demoPrompt: '', // We don't have this in DB yet
      examples: [], // We don't have this in DB yet
    };

    // Transform related skills
    const transformedRelatedSkills = (relatedSkills || []).map(s => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      shortDescription: s.description,
      category: s.category,
      stats: {
        installs: s.installs || 0,
        totalConversations: s.conversations || 0,
        rating: s.rating || 0,
        totalRatings: s.total_ratings || 0,
      },
    }));

    return NextResponse.json({
      skill: transformedSkill,
      relatedSkills: transformedRelatedSkills,
    });
  } catch (error) {
    console.error('Error fetching skill:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skill' },
      { status: 500 }
    );
  }
}