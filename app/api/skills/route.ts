import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    // Check if slug already exists
    const { data: existingSkill } = await supabase
      .from('skills')
      .select('id')
      .eq('slug', body.slug)
      .single();

    if (existingSkill) {
      return NextResponse.json(
        { error: 'A skill with this slug already exists' },
        { status: 409 }
      );
    }

    // Create new skill in database
    const { data: newSkill, error } = await supabase
      .from('skills')
      .insert({
        slug: body.slug,
        name: body.name,
        description: body.shortDescription,
        documentation: body.longDescription || body.shortDescription,
        category: body.category,
        tags: body.audienceTags,
        // For now, use placeholder author data
        // This will be replaced with actual user data from Better Auth
        author_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // Placeholder user ID
        author_name: body.authorName || 'Current User',
        author_username: body.authorUsername || 'currentuser',
        author_avatar: body.authorAvatar || null,
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

    // If user is logged in, also install the skill for them
    // This will be implemented when we integrate Better Auth
    if (body.autoInstall && body.userId) {
      await supabase
        .from('installed_skills')
        .insert({
          user_id: body.userId,
          skill_id: newSkill.id,
          enabled: true,
        });
    }

    return NextResponse.json({
      skill: transformedSkill,
      message: 'Skill created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to create skill' },
      { status: 500 }
    );
  }
}