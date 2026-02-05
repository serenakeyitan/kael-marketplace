import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from '@/lib/auth-server';

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

    const userId = session.user.id;

    // Fetch user's installed skills count
    const { count: installedCount } = await supabase
      .from('installed_skills')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Fetch user's created skills
    const { data: createdSkills, error: createdError } = await supabase
      .from('skills')
      .select('*')
      .eq('author_id', userId)
      .eq('is_published', true);

    if (createdError) {
      console.error('Error fetching created skills:', createdError);
    }

    // Fetch user's reviews count
    const { count: reviewsCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Calculate total skill usage (sum of usage_count from installed_skills)
    const { data: usageData } = await supabase
      .from('installed_skills')
      .select('usage_count')
      .eq('user_id', userId);

    const totalUsageCount = usageData?.reduce((sum, item) => sum + (item.usage_count || 0), 0) || 0;

    // Calculate stats from created skills
    let totalInstalls = 0;
    let totalConversations = 0;
    let totalRatings = 0;
    let sumRatings = 0;

    if (createdSkills && createdSkills.length > 0) {
      createdSkills.forEach(skill => {
        totalInstalls += skill.installs || 0;
        totalConversations += skill.conversations || 0;
        if (skill.rating && skill.total_ratings) {
          sumRatings += skill.rating * skill.total_ratings;
          totalRatings += skill.total_ratings;
        }
      });
    }

    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    // Get follower/following counts
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('better_auth_id', userId)
      .single();

    let followers = 0;
    let following = 0;

    if (userProfile) {
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userProfile.id);

      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userProfile.id);

      followers = followersCount || 0;
      following = followingCount || 0;
    }

    // Calculate achievements based on realistic thresholds
    const achievements = [
      // Installation achievements
      {
        id: '1',
        title: 'First Steps',
        description: 'Install your first skill',
        icon: 'Trophy',
        unlocked: (installedCount || 0) >= 1,
        progress: Math.min(100, (installedCount || 0) * 100)
      },
      {
        id: '2',
        title: 'Skill Explorer',
        description: 'Install 3 skills',
        icon: 'Sparkles',
        unlocked: (installedCount || 0) >= 3,
        progress: Math.min(100, ((installedCount || 0) / 3) * 100)
      },
      {
        id: '3',
        title: 'Power User',
        description: 'Install 10 skills',
        icon: 'Zap',
        unlocked: (installedCount || 0) >= 10,
        progress: Math.min(100, ((installedCount || 0) / 10) * 100)
      },
      // Usage achievements
      {
        id: '4',
        title: 'First Use',
        description: 'Use your first skill',
        icon: 'Play',
        unlocked: totalUsageCount >= 1,
        progress: Math.min(100, totalUsageCount * 100)
      },
      {
        id: '5',
        title: 'Active User',
        description: 'Use skills 5 times',
        icon: 'Activity',
        unlocked: totalUsageCount >= 5,
        progress: Math.min(100, (totalUsageCount / 5) * 100)
      },
      {
        id: '6',
        title: 'Power Player',
        description: 'Use skills 20 times',
        icon: 'Flame',
        unlocked: totalUsageCount >= 20,
        progress: Math.min(100, (totalUsageCount / 20) * 100)
      },
      // Creation achievements
      {
        id: '7',
        title: 'Skill Creator',
        description: 'Upload your first skill',
        icon: 'Code',
        unlocked: (createdSkills?.length || 0) >= 1,
        progress: Math.min(100, (createdSkills?.length || 0) * 100)
      },
      {
        id: '8',
        title: 'Prolific Creator',
        description: 'Upload 3 skills',
        icon: 'Package',
        unlocked: (createdSkills?.length || 0) >= 3,
        progress: Math.min(100, ((createdSkills?.length || 0) / 3) * 100)
      },
      {
        id: '9',
        title: 'Rising Star',
        description: 'Get 100+ installs on your skills',
        icon: 'Star',
        unlocked: totalInstalls >= 100,
        progress: Math.min(100, (totalInstalls / 100) * 100)
      },
      // Community achievements
      {
        id: '10',
        title: 'First Review',
        description: 'Post your first review',
        icon: 'MessageSquare',
        unlocked: (reviewsCount || 0) >= 1,
        progress: Math.min(100, (reviewsCount || 0) * 100)
      },
      {
        id: '11',
        title: 'Reviewer',
        description: 'Post 5 reviews',
        icon: 'Heart',
        unlocked: (reviewsCount || 0) >= 5,
        progress: Math.min(100, ((reviewsCount || 0) / 5) * 100)
      },
      {
        id: '12',
        title: 'Community Voice',
        description: 'Post 10 reviews',
        icon: 'Users',
        unlocked: (reviewsCount || 0) >= 10,
        progress: Math.min(100, ((reviewsCount || 0) / 10) * 100)
      }
    ];

    // Transform created skills for response
    const transformedCreatedSkills = (createdSkills || []).map(skill => ({
      id: skill.id,
      slug: skill.slug,
      name: skill.name,
      shortDescription: skill.description,
      category: skill.category,
      stats: {
        installs: skill.installs || 0,
        totalConversations: skill.conversations || 0,
        rating: skill.rating || 0,
        totalRatings: skill.total_ratings || 0
      },
      lastUpdated: skill.updated_at || skill.created_at
    }));

    return NextResponse.json({
      stats: {
        skillsCreated: createdSkills?.length || 0,
        skillsInstalled: installedCount || 0,
        totalUsage: totalConversations,
        totalInstalls: totalInstalls,
        averageRating: averageRating,
        followers: followers,
        following: following,
        achievements: achievements
      },
      createdSkills: transformedCreatedSkills
    });
  } catch (error) {
    console.error('Error in profile GET:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile data' },
      { status: 500 }
    );
  }
}