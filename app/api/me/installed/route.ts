import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from '@/lib/auth-server';

export const dynamic = 'force-dynamic'; // Disable caching

export async function GET() {
  try {
    // Get the current session
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch installed skills with full skill details
    const { data: installedSkills, error } = await supabase
      .from('installed_skills')
      .select(`
        *,
        skills (
          *
        )
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching installed skills:', error);
      return NextResponse.json(
        { error: 'Failed to fetch installed skills' },
        { status: 500 }
      );
    }

    // Transform the data to match frontend format
    const installedWithDetails = (installedSkills || []).map(installed => ({
      skillId: installed.skill_id,
      installedAt: installed.created_at,
      lastUsed: installed.last_used || installed.created_at,
      isEnabled: installed.enabled,
      usageCount: installed.usage_count || 0,
      skill: installed.skills ? {
        id: installed.skills.id,
        slug: installed.skills.slug,
        name: installed.skills.name,
        shortDescription: installed.skills.description,
        longDescription: installed.skills.documentation || installed.skills.description,
        category: installed.skills.category,
        audienceTags: installed.skills.tags || [],
        author: {
          name: installed.skills.author_name,
          username: installed.skills.author_username,
          avatar: installed.skills.author_avatar,
          isOfficial: false
        },
        stats: {
          installs: installed.skills.installs || 0,
          totalConversations: installed.skills.conversations || 0,
          rating: installed.skills.rating || 0,
          totalRatings: installed.skills.total_ratings || 0
        },
        version: '1.0.0',
        lastUpdated: installed.skills.updated_at || installed.skills.created_at,
        demoPrompt: '',
        examples: []
      } : null
    })).filter(item => item.skill);

    return NextResponse.json({
      installedSkills: installedWithDetails,
      total: installedWithDetails.length,
    });
  } catch (error) {
    console.error('Error in installed skills GET:', error);
    return NextResponse.json(
      { error: 'Failed to fetch installed skills' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { skillId } = body;

    if (!skillId) {
      return NextResponse.json(
        { error: 'Skill ID is required' },
        { status: 400 }
      );
    }

    // Check if skill exists
    const { data: skill } = await supabase
      .from('skills')
      .select('id')
      .eq('id', skillId)
      .single();

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    // Check if already installed
    const { data: existingInstall } = await supabase
      .from('installed_skills')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('skill_id', skillId)
      .single();

    if (existingInstall) {
      // Skill already installed, just return success
      return NextResponse.json({
        installed: {
          skillId: existingInstall.skill_id,
          installedAt: existingInstall.created_at,
          lastUsed: existingInstall.last_used || existingInstall.created_at,
          isEnabled: existingInstall.enabled,
          usageCount: existingInstall.usage_count || 0,
        },
        message: 'Skill already installed',
      }, { status: 200 });
    }

    // Add to installed skills
    const { data: newInstall, error } = await supabase
      .from('installed_skills')
      .insert({
        user_id: session.user.id,
        skill_id: skillId,
        enabled: true,
        last_used: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error installing skill:', error);
      return NextResponse.json(
        { error: 'Failed to install skill' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      installed: {
        skillId: newInstall.skill_id,
        installedAt: newInstall.created_at,
        lastUsed: newInstall.last_used || newInstall.created_at,
        isEnabled: newInstall.enabled,
        usageCount: 0,
      },
      message: 'Skill installed successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error in install skill POST:', error);
    return NextResponse.json(
      { error: 'Failed to install skill' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const skillId = searchParams.get('skillId');

    if (!skillId) {
      return NextResponse.json(
        { error: 'Skill ID is required' },
        { status: 400 }
      );
    }

    // Remove from installed skills
    const { error } = await supabase
      .from('installed_skills')
      .delete()
      .eq('user_id', session.user.id)
      .eq('skill_id', skillId);

    if (error) {
      console.error('Error uninstalling skill:', error);
      return NextResponse.json(
        { error: 'Failed to uninstall skill' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Skill uninstalled successfully',
    });
  } catch (error) {
    console.error('Error in uninstall skill DELETE:', error);
    return NextResponse.json(
      { error: 'Failed to uninstall skill' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { skillId, isEnabled, action } = body;

    if (!skillId) {
      return NextResponse.json(
        { error: 'Skill ID is required' },
        { status: 400 }
      );
    }

    // Handle uninstall action
    if (action === 'uninstall') {
      // Remove from installed skills
      const { error } = await supabase
        .from('installed_skills')
        .delete()
        .eq('user_id', session.user.id)
        .eq('skill_id', skillId);

      if (error) {
        console.error('Error uninstalling skill:', error);
        return NextResponse.json(
          { error: 'Failed to uninstall skill' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Skill uninstalled successfully',
      });
    }

    // Handle enable/disable
    if (isEnabled !== undefined) {
      const { data: updatedSkill, error } = await supabase
        .from('installed_skills')
        .update({
          enabled: isEnabled,
          last_used: new Date().toISOString(),
        })
        .eq('user_id', session.user.id)
        .eq('skill_id', skillId)
        .select()
        .single();

      if (error) {
        console.error('Error updating skill:', error);
        return NextResponse.json(
          { error: 'Failed to update skill' },
          { status: 500 }
        );
      }

      if (!updatedSkill) {
        return NextResponse.json(
          { error: 'Skill not found in installed skills' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        updated: {
          skillId: updatedSkill.skill_id,
          installedAt: updatedSkill.created_at,
          lastUsed: updatedSkill.last_used || updatedSkill.created_at,
          isEnabled: updatedSkill.enabled,
          usageCount: updatedSkill.usage_count || 0,
        },
        message: `Skill ${isEnabled ? 'enabled' : 'disabled'} successfully`,
      });
    }

    return NextResponse.json(
      { error: 'No action specified' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in update skill PATCH:', error);
    return NextResponse.json(
      { error: 'Failed to update skill' },
      { status: 500 }
    );
  }
}