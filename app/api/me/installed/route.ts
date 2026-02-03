import { NextResponse } from 'next/server';
import { mockInstalledSkills, mockSkills } from '@/data/mockSkills';

// In-memory storage for demo purposes
let installedSkills = [...mockInstalledSkills];

export async function GET() {
  // Get full skill details for installed skills
  const installedWithDetails = installedSkills.map(installed => {
    const skill = mockSkills.find(s => s.id === installed.skillId);
    return {
      ...installed,
      skill,
    };
  }).filter(item => item.skill);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));

  return NextResponse.json({
    installedSkills: installedWithDetails,
    total: installedWithDetails.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { skillId } = body;

    if (!skillId) {
      return NextResponse.json(
        { error: 'Skill ID is required' },
        { status: 400 }
      );
    }

    // Check if skill exists
    const skill = mockSkills.find(s => s.id === skillId);
    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    // Check if already installed
    const existingInstall = installedSkills.find(i => i.skillId === skillId);
    if (existingInstall) {
      return NextResponse.json(
        { error: 'Skill already installed' },
        { status: 400 }
      );
    }

    // Add to installed skills
    const newInstall = {
      skillId,
      installedAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      isEnabled: true,
      usageCount: 0,
    };

    installedSkills.push(newInstall);

    return NextResponse.json({
      installed: newInstall,
      message: 'Skill installed successfully',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to install skill' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skillId = searchParams.get('skillId');

    if (!skillId) {
      return NextResponse.json(
        { error: 'Skill ID is required' },
        { status: 400 }
      );
    }

    // Remove from installed skills
    const initialLength = installedSkills.length;
    installedSkills = installedSkills.filter(i => i.skillId !== skillId);

    if (installedSkills.length === initialLength) {
      return NextResponse.json(
        { error: 'Skill not found in installed skills' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Skill uninstalled successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to uninstall skill' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { skillId, isEnabled } = body;

    if (!skillId) {
      return NextResponse.json(
        { error: 'Skill ID is required' },
        { status: 400 }
      );
    }

    // Find and update installed skill
    const installedSkill = installedSkills.find(i => i.skillId === skillId);
    if (!installedSkill) {
      return NextResponse.json(
        { error: 'Skill not found in installed skills' },
        { status: 404 }
      );
    }

    installedSkill.isEnabled = isEnabled;

    return NextResponse.json({
      updated: installedSkill,
      message: `Skill ${isEnabled ? 'enabled' : 'disabled'} successfully`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update skill' },
      { status: 500 }
    );
  }
}