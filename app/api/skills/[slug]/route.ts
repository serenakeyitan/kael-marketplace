import { NextResponse } from 'next/server';
import { mockSkills } from '@/data/mockSkills';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  // Find skill by slug
  const skill = mockSkills.find(s => s.slug === slug);

  if (!skill) {
    return NextResponse.json(
      { error: 'Skill not found' },
      { status: 404 }
    );
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50));

  // Get related skills (same category or similar tags)
  const relatedSkills = mockSkills
    .filter(s =>
      s.id !== skill.id && (
        s.category === skill.category ||
        s.audienceTags.some(tag => skill.audienceTags.includes(tag))
      )
    )
    .slice(0, 4)
    .map(s => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      shortDescription: s.shortDescription,
      category: s.category,
      stats: s.stats,
    }));

  return NextResponse.json({
    skill,
    relatedSkills,
  });
}