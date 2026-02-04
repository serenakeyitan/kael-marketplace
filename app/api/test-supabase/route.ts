import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test 1: Check if we can connect and query skills
    const { data: skills, error: skillsError } = await supabase
      .from('skills')
      .select('*')
      .limit(5);

    if (skillsError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to query skills',
        details: skillsError
      }, { status: 500 });
    }

    // Test 2: Check if we can query user profiles
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(3);

    if (usersError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to query users',
        details: usersError
      }, { status: 500 });
    }

    // Test 3: Check if we can query reviews with joins
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        *,
        skills (
          name,
          slug
        )
      `)
      .limit(3);

    if (reviewsError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to query reviews',
        details: reviewsError
      }, { status: 500 });
    }

    // Test 4: Count total skills
    const { count, error: countError } = await supabase
      .from('skills')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to count skills',
        details: countError
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful!',
      data: {
        skillsCount: count,
        sampleSkills: skills?.map(s => ({ name: s.name, slug: s.slug, category: s.category })),
        sampleUsers: users?.map(u => ({ username: u.username, display_name: u.display_name })),
        sampleReviews: reviews?.map(r => ({
          rating: r.rating,
          content: r.content.substring(0, 50) + '...',
          skill: r.skills?.name
        }))
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error
    }, { status: 500 });
  }
}