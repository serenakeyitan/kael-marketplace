import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const skillId = searchParams.get('skillId');

  if (!skillId) {
    return NextResponse.json(
      { error: 'Skill ID is required' },
      { status: 400 }
    );
  }

  try {
    // First, get the skill ID from the slug if needed
    let actualSkillId = skillId;

    // Check if skillId is actually a slug (doesn't look like a UUID)
    if (!skillId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const { data: skill } = await supabase
        .from('skills')
        .select('id')
        .eq('slug', skillId)
        .single();

      if (skill) {
        actualSkillId = skill.id;
      }
    }

    // Fetch reviews for the skill with replies
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        review_replies (
          *
        )
      `)
      .eq('skill_id', actualSkillId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    // Transform reviews to match frontend format
    const transformedReviews = (reviews || []).map(review => ({
      id: review.id,
      skillId: review.skill_id,
      userId: review.user_id,
      userName: review.user_name,
      userAvatar: review.user_avatar,
      rating: review.rating,
      comment: review.content,
      createdAt: review.created_at,
      helpful: review.helpful_count || 0,
      notHelpful: 0, // We don't track this in DB yet
      reported: false, // We don't track this in DB yet
      replies: (review.review_replies || []).map((reply: any) => ({
        id: reply.id,
        userName: reply.user_name,
        userAvatar: reply.user_avatar,
        comment: reply.content,
        timestamp: reply.created_at,
        helpful: reply.helpful_count || 0,
        notHelpful: 0,
      })),
    }));

    // Calculate average rating
    const averageRating = transformedReviews.length > 0
      ? transformedReviews.reduce((sum, r) => sum + r.rating, 0) / transformedReviews.length
      : 0;

    return NextResponse.json({
      reviews: transformedReviews,
      total: transformedReviews.length,
      averageRating,
    });
  } catch (error) {
    console.error('Error in reviews GET:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { skillId, rating, comment, userName, userAvatar } = body;

    if (!skillId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get actual skill ID if a slug was provided
    let actualSkillId = skillId;
    if (!skillId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const { data: skill } = await supabase
        .from('skills')
        .select('id')
        .eq('slug', skillId)
        .single();

      if (skill) {
        actualSkillId = skill.id;
      } else {
        return NextResponse.json(
          { error: 'Skill not found' },
          { status: 404 }
        );
      }
    }

    const userId = session.user.id;
    const finalUserName = userName || session.user.name || session.user.email;

    // Check if user already reviewed this skill
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('skill_id', actualSkillId)
      .eq('user_id', userId)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this skill' },
        { status: 409 }
      );
    }

    // Create the review
    const { data: newReview, error } = await supabase
      .from('reviews')
      .insert({
        skill_id: actualSkillId,
        user_id: userId,
        user_name: finalUserName,
        user_username: finalUserName.toLowerCase().replace(/\s+/g, ''),
        user_avatar: userAvatar || session.user.image || null,
        rating,
        content: comment,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating review:', error);
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      );
    }

    // Transform for frontend
    const transformedReview = {
      id: newReview.id,
      skillId: newReview.skill_id,
      userId: newReview.user_id,
      userName: newReview.user_name,
      userAvatar: newReview.user_avatar,
      rating: newReview.rating,
      comment: newReview.content,
      createdAt: newReview.created_at,
      helpful: 0,
      notHelpful: 0,
      reported: false,
      replies: [],
    };

    return NextResponse.json({
      success: true,
      review: transformedReview
    });
  } catch (error) {
    console.error('Error in reviews POST:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { skillId, reviewId, action, voteType, replyData } = body;

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'vote':
        // Update helpful count
        if (voteType === 'helpful') {
          // First get current count
          const { data: review } = await supabase
            .from('reviews')
            .select('helpful_count')
            .eq('id', reviewId)
            .single();

          const { error } = await supabase
            .from('reviews')
            .update({
              helpful_count: (review?.helpful_count || 0) + 1
            })
            .eq('id', reviewId);

          if (error) {
            console.error('Error updating vote:', error);
            return NextResponse.json(
              { error: 'Failed to update vote' },
              { status: 500 }
            );
          }
        }
        break;

      case 'reply':
        if (!replyData || !replyData.comment) {
          return NextResponse.json(
            { error: 'Reply data is incomplete' },
            { status: 400 }
          );
        }

        const userId = session.user.id;
        const replyUserName = replyData.userName || session.user.name || session.user.email;

        const { data: newReply, error } = await supabase
          .from('review_replies')
          .insert({
            review_id: reviewId,
            user_id: userId,
            user_name: replyUserName,
            user_username: replyUserName.toLowerCase().replace(/\s+/g, ''),
            user_avatar: replyData.userAvatar || session.user.image || null,
            content: replyData.comment,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating reply:', error);
          return NextResponse.json(
            { error: 'Failed to create reply' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          reply: {
            id: newReply.id,
            userName: newReply.user_name,
            userAvatar: newReply.user_avatar,
            comment: newReply.content,
            timestamp: newReply.created_at,
            helpful: 0,
            notHelpful: 0,
          }
        });

      case 'voteReply':
        const { replyId } = body;
        if (!replyId) {
          return NextResponse.json(
            { error: 'Reply ID is required' },
            { status: 400 }
          );
        }

        if (voteType === 'helpful') {
          // First get current count
          const { data: reply } = await supabase
            .from('review_replies')
            .select('helpful_count')
            .eq('id', replyId)
            .single();

          const { error } = await supabase
            .from('review_replies')
            .update({
              helpful_count: (reply?.helpful_count || 0) + 1
            })
            .eq('id', replyId);

          if (error) {
            console.error('Error updating reply vote:', error);
            return NextResponse.json(
              { error: 'Failed to update vote' },
              { status: 500 }
            );
          }
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in reviews PATCH:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // For now, we'll allow deletion without checking user ownership
    // This will be updated when Better Auth is integrated
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('Error deleting review:', error);
      return NextResponse.json(
        { error: 'Failed to delete review' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in reviews DELETE:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}