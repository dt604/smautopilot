import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';
import { pollHeyGenStatus, downloadVideo } from '@/lib/engine/heygen';
import type { VideoMetadata } from '@/lib/engine/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * GET /api/render-video/status?video_id={uuid}
 *
 * Polling endpoint for the Video Preview UI. Checks the DB first to avoid
 * hammering HeyGen on every poll. Only calls HeyGen when the record is still
 * in a processing state.
 *
 * On HeyGen completion:
 *   1. Downloads the video file from HeyGen (expires in 7 days)
 *   2. Uploads it to Supabase Storage ("videos" bucket) for permanent storage
 *   3. Updates the videos record with video_url, thumbnail_url, status, and storage_path
 *
 * Returns:
 *   { success: true, data: { id, status, video_url, thumbnail_url, storage_path? } }
 */
export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get('video_id')?.trim();

  if (!videoId) {
    return NextResponse.json({ error: 'Missing query param: video_id' }, { status: 400 });
  }

  // --- Fast path: read current state from DB ---
  const { data: video, error: fetchError } = await supabase
    .from('videos')
    .select('id, heygen_job_id, status, video_url, thumbnail_url, metadata')
    .eq('id', videoId)
    .single();

  if (fetchError || !video) {
    return NextResponse.json(
      { error: `Video record not found: ${fetchError?.message ?? 'No record'}` },
      { status: 404 }
    );
  }

  // Already terminal — return immediately without hitting HeyGen
  if (video.status === 'completed' || video.status === 'failed') {
    return NextResponse.json({ success: true, data: video });
  }

  if (!video.heygen_job_id) {
    return NextResponse.json(
      { error: 'Video record has no HeyGen job ID — cannot poll status.' },
      { status: 422 }
    );
  }

  // --- Poll HeyGen for latest status ---
  let heygenResult;
  try {
    heygenResult = await pollHeyGenStatus(video.heygen_job_id);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'HeyGen status poll failed';
    console.error('[render-video/status] HeyGen poll error:', message);
    // Don't update DB — return current state with a warning
    return NextResponse.json({
      success: true,
      data: { ...video, _warning: message },
    });
  }

  // Still rendering — return current DB state, no updates needed
  if (heygenResult.status === 'pending' || heygenResult.status === 'processing') {
    return NextResponse.json({ success: true, data: { ...video, status: heygenResult.status } });
  }

  // --- Handle failure ---
  if (heygenResult.status === 'failed') {
    const errorMsg =
      heygenResult.error
        ? JSON.stringify(heygenResult.error)
        : 'HeyGen reported a rendering failure.';

    const updatedMetadata: VideoMetadata = {
      ...(video.metadata as VideoMetadata),
      error: errorMsg,
    };

    await supabase
      .from('videos')
      .update({ status: 'failed', metadata: updatedMetadata })
      .eq('id', videoId);

    return NextResponse.json({
      success: false,
      data: { ...video, status: 'failed' },
      error: errorMsg,
    });
  }

  // --- Handle completion: download → Supabase Storage → update DB ---
  let storagePath: string | null = null;
  let finalVideoUrl = heygenResult.video_url;

  if (heygenResult.video_url) {
    try {
      const videoBuffer = await downloadVideo(heygenResult.video_url);
      const fileName = `${videoId}/${video.heygen_job_id}.mp4`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, videoBuffer, {
          contentType: 'video/mp4',
          upsert: true,
        });

      if (uploadError) {
        // Non-fatal: log the error but still mark completed with the HeyGen URL.
        // The HeyGen URL is valid for 7 days — enough time for re-archival.
        console.error('[render-video/status] Storage upload failed:', uploadError.message);
      } else {
        storagePath = uploadData.path;
        // Get a permanent public URL from Supabase Storage
        const { data: publicUrlData } = supabase.storage
          .from('videos')
          .getPublicUrl(storagePath);
        finalVideoUrl = publicUrlData.publicUrl;
      }
    } catch (err) {
      console.error(
        '[render-video/status] Video download/upload failed:',
        err instanceof Error ? err.message : err
      );
    }
  }

  const updatedMetadata: VideoMetadata = {
    ...(video.metadata as VideoMetadata),
    storage_path: storagePath ?? undefined,
    duration_seconds: heygenResult.duration ?? undefined,
  };

  const { data: updatedVideo, error: updateError } = await supabase
    .from('videos')
    .update({
      status: 'completed',
      video_url: finalVideoUrl,
      thumbnail_url: heygenResult.thumbnail_url,
      metadata: updatedMetadata,
    })
    .eq('id', videoId)
    .select('id, heygen_job_id, status, video_url, thumbnail_url, metadata, created_at')
    .single();

  if (updateError) {
    console.error('[render-video/status] DB update failed:', updateError.message);
    return NextResponse.json(
      { error: `Failed to update video record: ${updateError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: updatedVideo });
}
