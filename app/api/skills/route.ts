import { NextResponse } from 'next/server';
import { mockSkills } from '@/data/mockSkills';
import { Skill } from '@/types/skill';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
  const sort = searchParams.get('sort') || 'popular';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');

  // Filter skills
  let filteredSkills = [...mockSkills];

  // Search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredSkills = filteredSkills.filter(
      skill =>
        skill.name.toLowerCase().includes(searchLower) ||
        skill.shortDescription.toLowerCase().includes(searchLower) ||
        skill.longDescription.toLowerCase().includes(searchLower) ||
        skill.audienceTags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  // Category filter
  if (category && category !== 'all') {
    filteredSkills = filteredSkills.filter(skill => skill.category === category);
  }

  // Audience tags filter
  if (tags.length > 0) {
    filteredSkills = filteredSkills.filter(skill =>
      tags.some(tag => skill.audienceTags.includes(tag as any))
    );
  }

  // Sort
  switch (sort) {
    case 'popular':
      filteredSkills.sort((a, b) => b.stats.totalConversations - a.stats.totalConversations);
      break;
    case 'new':
      filteredSkills.sort((a, b) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );
      break;
    case 'usage':
      filteredSkills.sort((a, b) => b.stats.totalConversations - a.stats.totalConversations);
      break;
    case 'rating':
      filteredSkills.sort((a, b) => (b.stats.rating || 0) - (a.stats.rating || 0));
      break;
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedSkills = filteredSkills.slice(startIndex, endIndex);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));

  return NextResponse.json({
    skills: paginatedSkills,
    total: filteredSkills.length,
    page,
    limit,
    totalPages: Math.ceil(filteredSkills.length / limit),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'slug', 'shortDescription', 'longDescription', 'category', 'audienceTags'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create new skill
    const newSkill: Skill = {
      id: Date.now().toString(),
      slug: body.slug,
      name: body.name,
      shortDescription: body.shortDescription,
      longDescription: body.longDescription,
      category: body.category,
      audienceTags: body.audienceTags,
      author: {
        name: body.authorName || 'Current User',
        isOfficial: false,
      },
      stats: {
        installs: 0,
        totalConversations: 0,
      },
      version: body.version || '1.0.0',
      lastUpdated: new Date().toISOString().split('T')[0],
      demoPrompt: body.demoPrompt || '',
      examples: body.examples || [],
    };

    // In a real app, you would save this to a database
    // For now, we just return the created skill
    return NextResponse.json({
      skill: newSkill,
      message: 'Skill created successfully',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create skill' },
      { status: 500 }
    );
  }
}