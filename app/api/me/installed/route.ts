import { NextResponse } from 'next/server';
import { mockInstalledSkills, mockSkills } from '@/data/mockSkills';

export const dynamic = 'force-dynamic'; // Disable caching

// Use the original arrays directly (for demo purposes)

export async function GET() {
  // Get full skill details for installed skills
  const installedWithDetails = mockInstalledSkills.map(installed => {
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
    const existingInstall = mockInstalledSkills.find(i => i.skillId === skillId);
    if (existingInstall) {
      // Skill already installed, just return success
      return NextResponse.json({
        installed: existingInstall,
        message: 'Skill already installed',
      }, { status: 200 });
    }

    // Add to installed skills
    const newInstall = {
      skillId,
      installedAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      isEnabled: true,
      usageCount: 0,
    };

    mockInstalledSkills.push(newInstall);

    return NextResponse.json({
      installed: newInstall,
      message: 'Skill installed successfully',
    }, { status: 201 });
  } catch {
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
    const indexToRemove = mockInstalledSkills.findIndex(i => i.skillId === skillId);

    if (indexToRemove === -1) {
      return NextResponse.json(
        { error: 'Skill not found in installed skills' },
        { status: 404 }
      );
    }

    mockInstalledSkills.splice(indexToRemove, 1);

    return NextResponse.json({
      message: 'Skill uninstalled successfully',
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to uninstall skill' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
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
      const indexToRemove = mockInstalledSkills.findIndex(i => i.skillId === skillId);

      if (indexToRemove === -1) {
        return NextResponse.json(
          { error: 'Skill not found in installed skills' },
          { status: 404 }
        );
      }

      mockInstalledSkills.splice(indexToRemove, 1);

      return NextResponse.json({
        message: 'Skill uninstalled successfully',
      });
    }

    // Handle enable/disable
    const installedSkill = mockInstalledSkills.find(i => i.skillId === skillId);
    if (!installedSkill) {
      return NextResponse.json(
        { error: 'Skill not found in installed skills' },
        { status: 404 }
      );
    }

    if (isEnabled !== undefined) {
      installedSkill.isEnabled = isEnabled;
    }

    return NextResponse.json({
      updated: installedSkill,
      message: `Skill ${isEnabled ? 'enabled' : 'disabled'} successfully`,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update skill' },
      { status: 500 }
    );
  }
}