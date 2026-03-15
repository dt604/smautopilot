import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';
import { submitHeyGenJob } from '@/lib/engine/heygen';
import type { GeneratedScript, VideoMetadata } from '@/lib/engine/types';
import type { AvatarStyle, VoiceEmotion } from '@/lib/engine/heygen';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * POST /api/render-video
 *
 * Fetches an approved script, assembles the full text, submits a job to HeyGen,
 * creates a `videos` record with status "processing", and returns immediately.
 * The frontend polls /api/render-video/status to track completion.
 *
 * Body:
 *   {
 *     script_id:        string   — UUID of an approved script
 *     avatar_id:        string   — HeyGen avatar ID (from Actor Selection UI)
 *     voice_id:         string   — HeyGen voice ID
 *     avatar_style?:    string   — "normal" | "circle" | "closeUp"
 *     emotion?:         string   — "Excited" | "Friendly" | "Serious" | "Soothing" | "Broadcaster"
 *     background_color?: string  — hex color e.g. "#000000"
 *   }
 *
 * Returns:
 *   { success: true, data: { video_id: string, heygen_job_id: string } }
 */
export async function POST(req: NextRequest) {
  let scriptId: string;
  let avatarId: string;
  let voiceId: string;
  let avatarStyle: AvatarStyle | undefined;
  let emotion: VoiceEmotion | undefined;
  let backgroundColor: string | undefined;

  try {
    const body = await req.json();
    scriptId = body?.script_id?.trim();
    avatarId = body?.avatar_id?.trim();
    voiceId = body?.voice_id?.trim();
    avatarStyle = body?.avatar_style;
    emotion = body?.emotion;
    backgroundColor = body?.background_color;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!scriptId) return NextResponse.json({ error: 'Missing field: script_id' }, { status: 400 });
  if (!avatarId) return NextResponse.json({ error: 'Missing field: avatar_id' }, { status: 400 });
  if (!voiceId) return NextResponse.json({ error: 'Missing field: voice_id' }, { status: 400 });

  // --- Fetch the script ---
  const { data: script, error: scriptError } = await supabase
    .from('scripts')
    .select('id, business_id, title, content, status')
    .eq('id', scriptId)
    .single();

  if (scriptError || !script) {
    return NextResponse.json(
      { error: `Script not found: ${scriptError?.message ?? 'No record'}` },
      { status: 404 }
    );
  }

  if (script.status !== 'approved') {
    return NextResponse.json(
      { error: `Script must be approved before rendering. Current status: "${script.status}"` },
      { status: 422 }
    );
  }

  // --- Parse script content and assemble text ---
  let parsed: GeneratedScript;
  try {
    parsed = JSON.parse(script.content) as GeneratedScript;
  } catch {
    return NextResponse.json({ error: 'Script content is malformed JSON.' }, { status: 422 });
  }

  const inputText = [parsed.hook, parsed.body, parsed.cta].join('\n\n');

  // --- Submit to HeyGen ---
  let heygenJobId: string;
  try {
    const job = await submitHeyGenJob({
      avatar_id: avatarId,
      voice_id: voiceId,
      input_text: inputText,
      title: parsed.title ?? script.title ?? 'SM Autopilot Video',
      avatar_style: avatarStyle,
      emotion: emotion,
      background_color: backgroundColor,
    });
    heygenJobId = job.video_id;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'HeyGen submit failed';
    console.error('[render-video] HeyGen error:', message);
    return NextResponse.json({ error: message }, { status: 502 });
  }

  // --- Create videos record ---
  const metadata: VideoMetadata = {
    avatar_id: avatarId,
    voice_id: voiceId,
    avatar_style: avatarStyle,
    emotion: emotion,
    background_color: backgroundColor,
  };

  const { data: video, error: dbError } = await supabase
    .from('videos')
    .insert({
      script_id: scriptId,
      heygen_job_id: heygenJobId,
      status: 'processing',
      metadata,
    })
    .select('id, heygen_job_id, status, created_at')
    .single();

  if (dbError) {
    console.error('[render-video] DB insert failed:', dbError.message);
    return NextResponse.json(
      { error: `Failed to create video record: ${dbError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      video_id: video.id,
      heygen_job_id: heygenJobId,
      status: 'processing',
    },
  });
}
