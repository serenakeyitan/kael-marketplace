import { NextResponse } from 'next/server';
import { mockUploadedSkills } from '@/data/mockSkills';

export const dynamic = 'force-dynamic'; // Disable caching

// Use the original array directly (for demo purposes)

export async function GET() {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));

  return NextResponse.json({
    mockUploadedSkills,
    total: mockUploadedSkills.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Create new uploaded skill
    const newSkill = {
      id: Date.now().toString(),
      slug: body.slug,
      name: body.name,
      shortDescription: body.shortDescription,
      longDescription: body.longDescription,
      category: body.category,
      audienceTags: body.audienceTags,
      author: {
        name: 'Current User',
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
      status: 'draft' as const,
      totalInstalls: 0,
      totalUsage: 0,
      weeklyActiveUsers: 0,
    };

    mockUploadedSkills.push(newSkill);

    return NextResponse.json({
      skill: newSkill,
      message: 'Skill uploaded successfully',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to upload skill' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { skillId, status } = body;

    if (!skillId) {
      return NextResponse.json(
        { error: 'Skill ID is required' },
        { status: 400 }
      );
    }

    // Find and update uploaded skill
    const skill = mockUploadedSkills.find(s => s.id === skillId);
    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    if (status) {
      skill.status = status;
      if (status === 'published' && !skill.publishedAt) {
        skill.publishedAt = new Date().toISOString();
      }
    }

    return NextResponse.json({
      skill,
      message: 'Skill updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update skill' },
      { status: 500 }
    );
  }
}