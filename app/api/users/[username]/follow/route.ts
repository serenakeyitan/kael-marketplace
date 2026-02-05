import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getServerSession } from '@/lib/auth-server';

export async function POST(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    // Get current session
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get the follower's profile
    const { data: followerProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('better_auth_id', userId)
      .single();

    if (!followerProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Get the user to follow
    const { data: followingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (!followingProfile) {
      return NextResponse.json(
        { error: 'User to follow not found' },
        { status: 404 }
      );
    }

    // Check if already following
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerProfile.id)
      .eq('following_id', followingProfile.id)
      .single();

    if (existingFollow) {
      return NextResponse.json(
        { error: 'Already following this user' },
        { status: 400 }
      );
    }

    // Create follow relationship
    const { error: followError } = await supabase
      .from('follows')
      .insert({
        follower_id: followerProfile.id,
        following_id: followingProfile.id
      });

    if (followError) {
      console.error('Error creating follow:', followError);
      return NextResponse.json(
        { error: 'Failed to follow user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully followed user'
    });
  } catch (error) {
    console.error('Error in follow POST:', error);
    return NextResponse.json(
      { error: 'Failed to follow user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    // Get current session
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get the follower's profile
    const { data: followerProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('better_auth_id', userId)
      .single();

    if (!followerProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Get the user to unfollow
    const { data: followingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (!followingProfile) {
      return NextResponse.json(
        { error: 'User to unfollow not found' },
        { status: 404 }
      );
    }

    // Delete follow relationship
    const { error: unfollowError } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerProfile.id)
      .eq('following_id', followingProfile.id);

    if (unfollowError) {
      console.error('Error unfollowing:', unfollowError);
      return NextResponse.json(
        { error: 'Failed to unfollow user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unfollowed user'
    });
  } catch (error) {
    console.error('Error in follow DELETE:', error);
    return NextResponse.json(
      { error: 'Failed to unfollow user' },
      { status: 500 }
    );
  }
}