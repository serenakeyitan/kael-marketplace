import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from '@/lib/auth-server';
import { generateSlugWithSuffix, sanitizeSlug } from '@/lib/slug-utils';

export const dynamic = 'force-dynamic'; // Disable caching

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
  const sort = searchParams.get('sort') || 'popular';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');

  try {
    // Start building the query
    let query = supabase
      .from('skills')
      .select('*', { count: 'exact' })
      .eq('is_published', true);

    // Search filter - search in name, description, and tags
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Category filter
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Tags filter - check if any of the requested tags are in the skill's tags array
    if (tags.length > 0) {
      query = query.contains('tags', tags);
    }

    // Sorting
    switch (sort) {
      case 'popular':
        query = query.order('installs', { ascending: false });
        break;
      case 'new':
        query = query.order('created_at', { ascending: false });
        break;
      case 'usage':
        query = query.order('conversations', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      default:
        query = query.order('installs', { ascending: false });
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    query = query.range(startIndex, startIndex + limit - 1);

    // Execute query
    const { data: skills, error, count } = await query;

    if (error) {
      console.error('Error fetching skills:', error);
      return NextResponse.json(
        { error: 'Failed to fetch skills' },
        { status: 500 }
      );
    }

    // Transform skills to match frontend format
    const transformedSkills = skills?.map(skill => ({
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
      },
      version: '1.0.0', // We don't have version in DB yet
      lastUpdated: skill.updated_at || skill.created_at,
      githubUrl: skill.github_url,
      icon: skill.icon,
    })) || [];

    return NextResponse.json({
      skills: transformedSkills,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'slug', 'shortDescription', 'category', 'audienceTags'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Get current user session
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required to create skills' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Fetch user profile to get username and other details
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, username, display_name, avatar_url')
      .eq('better_auth_id', userId)
      .single();

    if (profileError || !userProfile) {
      console.error('Error fetching user profile:', profileError);
      // Fallback if profile not found - use email-based username
      const fallbackUsername = session.user.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
      const userProfileFallback = {
        id: userId,
        username: fallbackUsername,
        display_name: session.user.name || session.user.email || 'User',
        avatar_url: session.user.image || null,
      };

      // Use fallback profile
      Object.assign(userProfile || {}, userProfileFallback);
    }

    // Sanitize the base slug
    let baseSlug = sanitizeSlug(body.slug);
    let finalSlug = baseSlug;
    let attempt = 0;
    const maxAttempts = 10;
    let slugModified = false;

    // Try to find a unique slug with retry logic
    while (attempt < maxAttempts) {
      // Generate slug for this attempt
      finalSlug = generateSlugWithSuffix(baseSlug, userProfile?.username || null, attempt);

      // Check if this slug already exists
      const { data: existingSkill } = await supabase
        .from('skills')
        .select('id')
        .eq('slug', finalSlug)
        .single();

      if (!existingSkill) {
        // Slug is available, we can use it
        if (attempt > 0) {
          slugModified = true;
        }
        break;
      }

      // Slug exists, try next attempt
      attempt++;
    }

    // If we exhausted all attempts, return error
    if (attempt >= maxAttempts) {
      return NextResponse.json(
        {
          error: `Could not generate a unique slug after ${maxAttempts} attempts. Please try a different name.`,
          suggestedSlug: `${baseSlug}-${userProfile?.username}-${Date.now()}`
        },
        { status: 409 }
      );
    }

    // Create new skill in database with the final unique slug
    const { data: newSkill, error } = await supabase
      .from('skills')
      .insert({
        slug: finalSlug,
        name: body.name,
        description: body.shortDescription,
        documentation: body.longDescription || body.shortDescription,
        category: body.category,
        tags: body.audienceTags,
        // Use real user data from profile
        author_id: userProfile?.id || userId,
        author_name: userProfile?.display_name || session.user.name || 'User',
        author_username: userProfile?.username || 'user',
        author_avatar: userProfile?.avatar_url || session.user.image || null,
        github_url: body.githubUrl || null,
        icon: body.icon || null,
        is_published: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating skill:', error);
      return NextResponse.json(
        { error: 'Failed to create skill' },
        { status: 500 }
      );
    }

    // Transform the response to match frontend format
    const transformedSkill = {
      id: newSkill.id,
      slug: newSkill.slug,
      name: newSkill.name,
      shortDescription: newSkill.description,
      longDescription: newSkill.documentation,
      category: newSkill.category,
      audienceTags: newSkill.tags,
      author: {
        name: newSkill.author_name,
        username: newSkill.author_username,
        avatar: newSkill.author_avatar,
        isOfficial: false,
      },
      stats: {
        installs: 0,
        totalConversations: 0,
        rating: 0,
        totalRatings: 0,
        weeklyActiveUsers: 0,
      },
      version: '1.0.0',
      lastUpdated: newSkill.created_at,
      githubUrl: newSkill.github_url,
      icon: newSkill.icon,
    };

    // Auto-install the skill for the creator
    if (body.autoInstall !== false) { // Default to true
      try {
        await supabase
          .from('installed_skills')
          .insert({
            user_id: userProfile?.id || userId,
            skill_id: newSkill.id,
            enabled: true,
          });
      } catch (installError) {
        console.error('Error auto-installing skill:', installError);
        // Don't fail the whole request if auto-install fails
      }
    }

    return NextResponse.json({
      skill: transformedSkill,
      message: slugModified
        ? `Skill created successfully with slug "${finalSlug}" (name was adjusted for uniqueness)`
        : 'Skill created successfully',
      slugModified,
      originalSlug: baseSlug,
      finalSlug,
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to create skill' },
      { status: 500 }
    );
  }
}