import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  const { username } = params;

  try {
    // First, get the user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (profileError || !userProfile) {
      // If no user profile exists, create a mock one for now
      // This will be replaced when Better Auth sync is implemented
      const mockProfile = {
        id: `mock-${username}`,
        username: username,
        name: username === 'the-glitch' ? 'The Glitch' : username.replace(/-/g, ' '),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        description: 'Independent researcher on AI skills and prompt engineering. Building the future of automation.',
        followers: 626,
        following: 2,
        isFollowing: false
      };

      // Get skills for this author
      const { data: skills, error: skillsError } = await supabase
        .from('skills')
        .select('*')
        .eq('author_username', username)
        .eq('is_published', true)
        .order('installs', { ascending: false });

      if (skillsError) {
        console.error('Error fetching skills:', skillsError);
      }

      // Calculate total users (sum of installs) and popularity (sum of conversations)
      let totalUsers = 0;
      let popularity = 0;

      if (skills && skills.length > 0) {
        skills.forEach(skill => {
          totalUsers += skill.installs || 0;
          popularity += skill.conversations || 0;
        });
      }

      // Transform skills to match frontend format
      const transformedSkills = (skills || []).map(skill => ({
        id: skill.id,
        slug: skill.slug,
        name: skill.name,
        shortDescription: skill.description,
        longDescription: skill.documentation || skill.description,
        category: skill.category,
        audienceTags: skill.tags || [],
        author: {
          name: mockProfile.name,
          username: mockProfile.username,
          avatar: mockProfile.avatar,
          isOfficial: false
        },
        stats: {
          installs: skill.installs || 0,
          totalConversations: skill.conversations || 0,
          rating: skill.rating || 0,
          totalRatings: skill.total_ratings || 0
        },
        version: '1.0.0',
        lastUpdated: skill.updated_at || skill.created_at,
        demoPrompt: '',
        examples: []
      }));

      return NextResponse.json({
        profile: {
          ...mockProfile,
          totalUsers,
          popularity,
          skills: transformedSkills
        }
      });
    }

    // If user profile exists (after Better Auth sync)
    // Get skills for this author
    const { data: skills, error: skillsError } = await supabase
      .from('skills')
      .select('*')
      .eq('author_username', username)
      .eq('is_published', true)
      .order('installs', { ascending: false });

    if (skillsError) {
      console.error('Error fetching skills:', skillsError);
    }

    // Calculate total users (sum of installs) and popularity (sum of conversations)
    let totalUsers = 0;
    let popularity = 0;

    if (skills && skills.length > 0) {
      skills.forEach(skill => {
        totalUsers += skill.installs || 0;
        popularity += skill.conversations || 0;
      });
    }

    // Get follower/following counts (for now, use default values)
    // These will be updated when we implement the follow system
    const followers = 626;
    const following = 2;
    const isFollowing = false;

    // Transform skills to match frontend format
    const transformedSkills = (skills || []).map(skill => ({
      id: skill.id,
      slug: skill.slug,
      name: skill.name,
      shortDescription: skill.description,
      longDescription: skill.documentation || skill.description,
      category: skill.category,
      audienceTags: skill.tags || [],
      author: {
        name: userProfile.name,
        username: userProfile.username,
        avatar: userProfile.avatar,
        isOfficial: false
      },
      stats: {
        installs: skill.installs || 0,
        totalConversations: skill.conversations || 0,
        rating: skill.rating || 0,
        totalRatings: skill.total_ratings || 0
      },
      version: '1.0.0',
      lastUpdated: skill.updated_at || skill.created_at,
      demoPrompt: '',
      examples: []
    }));

    return NextResponse.json({
      profile: {
        id: userProfile.id,
        username: userProfile.username,
        name: userProfile.name,
        avatar: userProfile.avatar,
        description: userProfile.bio || 'Independent researcher on AI skills and prompt engineering. Building the future of automation.',
        followers,
        following,
        totalUsers,
        popularity,
        isFollowing,
        skills: transformedSkills
      }
    });
  } catch (error) {
    console.error('Error in user profile GET:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}