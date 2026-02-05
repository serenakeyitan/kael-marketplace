import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from '@/lib/auth-server';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Get the current session
    const session = await getServerSession();

    if (!session?.user) {
      // Still track anonymous usage for the skill
      const { data: skill } = await supabase
        .from('skills')
        .select('id, conversations')
        .eq('slug', slug)
        .single();

      if (skill) {
        // Increment conversations count for the skill
        await supabase
          .from('skills')
          .update({
            conversations: (skill.conversations || 0) + 1
          })
          .eq('id', skill.id);
      }

      return NextResponse.json({
        success: true,
        message: 'Usage tracked (anonymous)'
      });
    }

    const userId = session.user.id;

    // Get skill ID from slug
    const { data: skill } = await supabase
      .from('skills')
      .select('id, conversations')
      .eq('slug', slug)
      .single();

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    // Check if user has this skill installed
    const { data: installedSkill } = await supabase
      .from('installed_skills')
      .select('id, usage_count')
      .eq('user_id', userId)
      .eq('skill_id', skill.id)
      .single();

    if (installedSkill) {
      // Update usage count for the installed skill
      await supabase
        .from('installed_skills')
        .update({
          usage_count: (installedSkill.usage_count || 0) + 1,
          last_used: new Date().toISOString()
        })
        .eq('id', installedSkill.id);
    }

    // Increment conversations count for the skill
    await supabase
      .from('skills')
      .update({
        conversations: (skill.conversations || 0) + 1
      })
      .eq('id', skill.id);

    // Update achievement progress for skills_used
    const { data: progress } = await supabase
      .from('achievement_progress')
      .select('metric_value')
      .eq('user_id', userId)
      .eq('metric_type', 'skills_used')
      .single();

    if (progress) {
      await supabase
        .from('achievement_progress')
        .update({
          metric_value: progress.metric_value + 1,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('metric_type', 'skills_used');
    } else {
      await supabase
        .from('achievement_progress')
        .insert({
          user_id: userId,
          metric_type: 'skills_used',
          metric_value: 1
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Usage tracked successfully',
      usageCount: installedSkill ? (installedSkill.usage_count || 0) + 1 : 1
    });
  } catch (error) {
    console.error('Error tracking skill usage:', error);
    return NextResponse.json(
      { error: 'Failed to track usage' },
      { status: 500 }
    );
  }
}