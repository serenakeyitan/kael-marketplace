import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const cookieStore = await cookies();

    // Get user_id from cookie
    const userIdCookie = cookieStore.get('user_id');
    if (!userIdCookie) {
      // Return empty array for anonymous users
      return NextResponse.json({ skills: [] });
    }

    // Fetch liked skills with full skill details
    const { data: likedSkills, error } = await supabase
      .from('liked_skills')
      .select(`
        skill_id,
        created_at,
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
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching liked skills:', error);
      return NextResponse.json({ skills: [] });
    }

    // Format the response
    const formattedSkills = likedSkills?.map(item => ({
      ...item.skills,
      liked_at: item.created_at
    })) || [];

    return NextResponse.json({ skills: formattedSkills });
  } catch (error) {
    console.error('Error in liked skills API:', error);
    return NextResponse.json({ skills: [] });
  }
}