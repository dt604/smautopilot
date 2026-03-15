import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';

/**
 * GET /api/social/posts
 *
 * Fetches all social posts from the database for the calendar view.
 * Joins with the videos table to get thumbnails.
 */
export async function GET() {
  const { data, error } = await supabase
    .from('social_posts')
    .select(`
      id,
      platform,
      caption,
      status,
      scheduled_at,
      created_at,
      videos (
        video_url
      )
    `)
    .order('scheduled_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
