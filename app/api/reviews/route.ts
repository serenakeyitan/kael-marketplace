import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for development (replace with database in production)
interface Reply {
  id: string;
  helpful?: number;
  notHelpful?: number;
}

interface Review {
  id: string;
  skillId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
  notHelpful?: number;
  reported: boolean;
  replies?: Reply[];
  isRecommended?: boolean;
}
const reviews = new Map<string, Review[]>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const skillId = searchParams.get('skillId');

  if (!skillId) {
    return NextResponse.json(
      { error: 'Skill ID is required' },
      { status: 400 }
    );
  }

  const skillReviews = reviews.get(skillId) || [];

  return NextResponse.json({
    reviews: skillReviews,
    total: skillReviews.length,
    averageRating: skillReviews.length > 0
      ? skillReviews.reduce((sum, r) => sum + r.rating, 0) / skillReviews.length
      : 0
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skillId, rating, comment, userName, userAvatar } = body;

    if (!skillId || !rating || !comment || !userName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newReview: Review = {
      id: Date.now().toString(),
      skillId,
      userId: 'user-1', // In production, this would come from auth
      userName,
      rating,
      comment,
      createdAt: new Date().toISOString(),
      helpful: 0,
      reported: false
    };

    const skillReviews = reviews.get(skillId) || [];
    skillReviews.unshift(newReview); // Add to beginning
    reviews.set(skillId, skillReviews);

    return NextResponse.json({ success: true, review: newReview });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { skillId, reviewId, action, voteType, replyData } = body;

    if (!skillId || !reviewId) {
      return NextResponse.json(
        { error: 'Skill ID and Review ID are required' },
        { status: 400 }
      );
    }

    const skillReviews = reviews.get(skillId) || [];
    const reviewIndex = skillReviews.findIndex(r => r.id === reviewId);

    if (reviewIndex === -1) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    const review = skillReviews[reviewIndex];

    switch (action) {
      case 'vote':
        if (voteType === 'helpful') {
          review.helpful = (review.helpful || 0) + 1;
        } else if (voteType === 'notHelpful') {
          review.notHelpful = (review.notHelpful || 0) + 1;
        }
        break;

      case 'reply':
        if (!replyData || !replyData.comment || !replyData.userName) {
          return NextResponse.json(
            { error: 'Reply data is incomplete' },
            { status: 400 }
          );
        }

        const newReply = {
          id: `${reviewId}-${Date.now()}`,
          userName: replyData.userName,
          userAvatar: replyData.userAvatar || null,
          comment: replyData.comment,
          timestamp: new Date().toISOString(),
          helpful: 0,
          notHelpful: 0
        };

        review.replies = review.replies || [];
        review.replies.push(newReply);
        break;

      case 'voteReply':
        const { replyId } = body;
        if (!replyId) {
          return NextResponse.json(
            { error: 'Reply ID is required' },
            { status: 400 }
          );
        }

        const reply = review.replies?.find((r: Reply) => r.id === replyId);
        if (!reply) {
          return NextResponse.json(
            { error: 'Reply not found' },
            { status: 404 }
          );
        }

        if (voteType === 'helpful') {
          reply.helpful = (reply.helpful || 0) + 1;
        } else if (voteType === 'notHelpful') {
          reply.notHelpful = (reply.notHelpful || 0) + 1;
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    skillReviews[reviewIndex] = review;
    reviews.set(skillId, skillReviews);

    return NextResponse.json({ success: true, review });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skillId = searchParams.get('skillId');
    const reviewId = searchParams.get('reviewId');

    if (!skillId || !reviewId) {
      return NextResponse.json(
        { error: 'Skill ID and Review ID are required' },
        { status: 400 }
      );
    }

    const skillReviews = reviews.get(skillId) || [];
    const filteredReviews = skillReviews.filter(r => r.id !== reviewId);

    if (filteredReviews.length === skillReviews.length) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    reviews.set(skillId, filteredReviews);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}