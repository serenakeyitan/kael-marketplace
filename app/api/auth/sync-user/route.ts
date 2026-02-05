import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, name, image, username } = body;

    if (!id || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      );
    }

    // Generate username if not provided
    const finalUsername = username || email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

    // Check if user profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', id)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          email,
          name: name || email.split('@')[0],
          username: finalUsername,
          avatar: image || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
        return NextResponse.json(
          { error: 'Failed to update user profile' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'User profile updated',
        username: finalUsername
      });
    } else {
      // Create new profile
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id,
          email,
          name: name || email.split('@')[0],
          username: finalUsername,
          avatar: image || null,
          role: 'user',
          bio: null,
          website: null,
          is_verified: false,
          is_official_author: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        // If username conflict, generate a unique one
        if (insertError.code === '23505' && insertError.message.includes('username')) {
          const uniqueUsername = `${finalUsername}_${Date.now().toString(36)}`;

          const { error: retryError } = await supabase
            .from('user_profiles')
            .insert({
              id,
              email,
              name: name || email.split('@')[0],
              username: uniqueUsername,
              avatar: image || null,
              role: 'user',
              bio: null,
              website: null,
              is_verified: false,
              is_official_author: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (retryError) {
            console.error('Error creating user profile with unique username:', retryError);
            return NextResponse.json(
              { error: 'Failed to create user profile' },
              { status: 500 }
            );
          }

          return NextResponse.json({
            success: true,
            message: 'User profile created',
            username: uniqueUsername
          });
        }

        console.error('Error creating user profile:', insertError);
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'User profile created',
        username: finalUsername
      });
    }
  } catch (error) {
    console.error('Error in sync-user:', error);
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    );
  }
}