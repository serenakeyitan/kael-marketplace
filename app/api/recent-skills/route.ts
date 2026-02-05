import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();

    // Get user_id from cookie
    const userIdCookie = cookieStore.get('user_id');
    if (!userIdCookie) {
      // Return empty array for anonymous users
      return NextResponse.json({ skills: [] });
    }

    // Fetch recent skills with full skill details
    const { data: recentSkills, error } = await supabase
      .from('recent_skills')
      .select(`
        skill_id,
        viewed_at,
        skills (
          id,
          name,
          slug,
          short_description,
          icon,
          category,
          stats,
          author,
          verified,
          badge
        )
      `)
      .eq('user_id', userIdCookie.value)
      .order('viewed_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching recent skills:', error);
      return NextResponse.json({ skills: [] });
    }

    // Format the response
    const formattedSkills = recentSkills?.map(item => ({
      ...item.skills,
      viewed_at: item.viewed_at
    })) || [];

    return NextResponse.json({ skills: formattedSkills });
  } catch (error) {
    console.error('Error in recent skills API:', error);
    return NextResponse.json({ skills: [] });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    // Get user_id from cookie
    const userIdCookie = cookieStore.get('user_id');
    if (!userIdCookie) {
      // Don't track for anonymous users
      return NextResponse.json({ success: true });
    }

    const { skillId } = await request.json();

    if (!skillId) {
      return NextResponse.json(
        { error: 'Skill ID is required' },
        { status: 400 }
      );
    }

    // Use the database function to add/update recent skill
    const { error } = await supabase.rpc('add_recent_skill', {
      p_user_id: userIdCookie.value,
      p_skill_id: skillId
    });

    if (error) {
      console.error('Error adding recent skill:', error);
      return NextResponse.json(
        { error: 'Failed to track recent skill' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in recent skills API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}