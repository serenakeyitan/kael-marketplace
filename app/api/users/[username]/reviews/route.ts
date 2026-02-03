import { NextRequest, NextResponse } from 'next/server';

// This would be connected to your database in production
// For now, using mock data

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  const { username } = params;

  // Mock user reviews data
  const mockUserReviews = [
    {
      id: '1',
      skillId: 'ai-coding-assistant',
      skillName: 'AI Coding Assistant',
      skillSlug: 'ai-coding-assistant',
      rating: 5,
      comment: 'This skill has revolutionized my coding workflow. The AI suggestions are incredibly accurate!',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      helpful: 45,
      notHelpful: 2,
      isRecommended: true
    },
    {
      id: '2',
      skillId: 'content-generator',
      skillName: 'Content Generator Pro',
      skillSlug: 'content-generator',
      rating: 4,
      comment: 'Great for generating ideas and drafts. Sometimes needs fine-tuning but overall very helpful.',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      helpful: 23,
      notHelpful: 5,
      isRecommended: true
    },
    {
      id: '3',
      skillId: 'data-analyzer',
      skillName: 'Data Analyzer',
      skillSlug: 'data-analyzer',
      rating: 5,
      comment: 'Excellent for quick data analysis and visualization. Saves hours of work!',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      helpful: 67,
      notHelpful: 1,
      isRecommended: true
    }
  ];

  // Filter reviews if the username matches (in a real app, this would be a database query)
  const userReviews = username ? mockUserReviews : [];

  return NextResponse.json({
    reviews: userReviews,
    total: userReviews.length,
    averageRating: userReviews.length > 0
      ? userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length
      : 0
  });
}