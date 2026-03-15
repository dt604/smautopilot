import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';
import { schedulePost } from '@/lib/engine/ayrshare';
import type { SocialPlatform } from '@/lib/engine/types';

export const runtime = 'nodejs';
export const maxDuration = 30;

const VALID_PLATFORMS = new Set<SocialPlatform>(['tiktok', 'instagram', 'youtube']);

/**
 * POST /api/schedule-post
 *
 * Fetches the video URL from Supabase, submits to Ayrshare for scheduling,
 * and inserts one row per platform into the social_posts table.
 *
 * Body:
 *   {
 *     video_id:     string                              — UUID from videos table
 *     caption:      string                              — post caption / description
 *     platforms:    ('tiktok' | 'instagram' | 'youtube')[]
 *     scheduled_at?: string                             — ISO 8601 UTC, e.g. "2026-07-10T14:00:00Z"
 *   }
 *
 * Returns:
 *   { success: true, data: { posts: SavedSocialPost[], ayrshare_post_id: string } }
 */
export async function POST(req: NextRequest) {
  let videoId: string;
  let caption: string;
  let platforms: SocialPlatform[];
  let scheduledAt: string | undefined;

  try {
    const body = await req.json();
    videoId = body?.video_id?.trim();
    caption = body?.caption?.trim();
    scheduledAt = body?.scheduled_at?.trim() || undefined;

    const rawPlatforms: unknown[] = Array.isArray(body?.platforms) ? body.platforms : [];
    platforms = rawPlatforms.filter(
      (p): p is SocialPlatform => typeof p === 'string' && VALID_PLATFORMS.has(p as SocialPlatform)
    );
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!videoId)         return NextResponse.json({ error: 'Missing field: video_id' },  { status: 400 });
  if (!caption)         return NextResponse.json({ error: 'Missing field: caption' },    { status: 400 });
  if (!platforms.length) return NextResponse.json({ error: 'Provide at least one valid platform: tiktok, instagram, youtube' }, { status: 400 });

  // --- Step 1: Fetch the video URL from Supabase ---
  const { data: video, error: videoError } = await supabase
    .from('videos')
    .select('id, video_url, status')
    .eq('id', videoId)
    .single();

  if (videoError || !video) {
    return NextResponse.json(
      { error: `Video not found: ${videoError?.message ?? 'No record'}` },
      { status: 404 }
    );
  }

  if (video.status !== 'completed') {
    return NextResponse.json(
      { error: `Video is not ready for publishing. Current status: "${video.status}"` },
      { status: 422 }
    );
  }

  if (!video.video_url) {
    return NextResponse.json(
      { error: 'Video record has no URL. Ensure the render completed successfully.' },
      { status: 422 }
    );
  }

  // --- Step 2: Submit to Ayrshare ---
  let ayrshareResult;
  try {
    ayrshareResult = await schedulePost({
      videoUrl: video.video_url,
      caption,
      platforms,
      scheduledAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ayrshare submission failed';
    console.error('[schedule-post] Ayrshare error:', message);
    return NextResponse.json({ error: message }, { status: 502 });
  }

  // --- Step 3: Fan out into one social_posts row per platform ---
  const now = new Date().toISOString();
  const rows = platforms.map((platform) => ({
    video_id: videoId,
    platform,
    caption,
    scheduled_at: scheduledAt ?? null,
    posted_at: ayrshareResult.isScheduled ? null : now,
    external_post_id: ayrshareResult.platformPostIds[platform] ?? null,
    ayrshare_post_id: ayrshareResult.ayrshare_post_id,
    status: ayrshareResult.isScheduled ? 'scheduled' : 'posted',
  }));

  const { data: savedPosts, error: dbError } = await supabase
    .from('social_posts')
    .insert(rows)
    .select('id, video_id, platform, caption, scheduled_at, posted_at, external_post_id, status, created_at');

  if (dbError) {
    console.error('[schedule-post] DB insert failed:', dbError.message);
    return NextResponse.json(
      { error: `Posts submitted to Ayrshare but failed to save records: ${dbError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      posts: savedPosts,
      ayrshare_post_id: ayrshareResult.ayrshare_post_id,
      published_immediately: !ayrshareResult.isScheduled,
    },
  });
}
