/**
 * HeyGen API client — Video Generation v2 + Status polling.
 *
 * Docs:
 *   Submit : POST https://api.heygen.com/v2/video/generate
 *   Status : GET  https://api.heygen.com/v1/video_status.get?video_id={id}
 */

const BASE = 'https://api.heygen.com';

export type HeyGenStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type AvatarStyle = 'normal' | 'circle' | 'closeUp';
export type VoiceEmotion = 'Excited' | 'Friendly' | 'Serious' | 'Soothing' | 'Broadcaster';

export interface SubmitVideoOptions {
  /** HeyGen avatar ID — user selects from the Actor Selection UI */
  avatar_id: string;
  /** HeyGen voice ID */
  voice_id: string;
  /** Full script text (hook + body + cta, already assembled) */
  input_text: string;
  /** Internal title for the HeyGen dashboard */
  title?: string;
  avatar_style?: AvatarStyle;
  emotion?: VoiceEmotion;
  /** Hex color for background, e.g. '#000000'. Defaults to black. */
  background_color?: string;
  /** Speaking speed multiplier. 1 = normal. */
  speed?: number;
}

export interface HeyGenJobResult {
  video_id: string;
}

export interface HeyGenStatusResult {
  status: HeyGenStatus;
  video_url: string | null;
  thumbnail_url: string | null;
  duration: number | null;
  error: Record<string, unknown> | null;
}

function getApiKey(): string {
  const key = process.env.HEYGEN_API_KEY;
  if (!key) throw new Error('HEYGEN_API_KEY is not set in environment variables.');
  return key;
}

/**
 * Submits a video generation job to HeyGen.
 * Dimension is fixed at 1080×1920 (9:16 vertical — TikTok/Reels/Shorts).
 * Returns the HeyGen video_id immediately; actual rendering is async.
 */
export async function submitHeyGenJob(options: SubmitVideoOptions): Promise<HeyGenJobResult> {
  const apiKey = getApiKey();

  const body = {
    title: options.title ?? 'SM Autopilot Video',
    video_inputs: [
      {
        character: {
          type: 'avatar',
          avatar_id: options.avatar_id,
          avatar_style: options.avatar_style ?? 'normal',
          scale: 1,
        },
        voice: {
          type: 'text',
          voice_id: options.voice_id,
          input_text: options.input_text,
          speed: options.speed ?? 1,
          emotion: options.emotion ?? 'Friendly',
        },
        background: {
          type: 'color',
          value: options.background_color ?? '#000000',
        },
      },
    ],
    dimension: { width: 1080, height: 1920 },
    caption: false,
  };

  const res = await fetch(`${BASE}/v2/video/generate`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HeyGen submit failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  const videoId = json?.video_id ?? json?.data?.video_id;
  if (!videoId) throw new Error(`HeyGen returned no video_id: ${JSON.stringify(json)}`);

  return { video_id: videoId };
}

/**
 * Polls HeyGen for the current status of a video job.
 * Call this from the /api/render-video/status endpoint on each frontend poll.
 */
export async function pollHeyGenStatus(heygenVideoId: string): Promise<HeyGenStatusResult> {
  const apiKey = getApiKey();

  const res = await fetch(
    `${BASE}/v1/video_status.get?video_id=${encodeURIComponent(heygenVideoId)}`,
    {
      headers: { 'x-api-key': apiKey },
      signal: AbortSignal.timeout(10_000),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HeyGen status check failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  const data = json?.data ?? {};

  return {
    status: data.status ?? 'pending',
    video_url: data.video_url ?? null,
    thumbnail_url: data.thumbnail_url ?? null,
    duration: data.duration ?? null,
    error: data.error ?? null,
  };
}

/**
 * Downloads a completed HeyGen video and returns it as a Buffer.
 * HeyGen video URLs expire after 7 days — we immediately archive to Supabase Storage.
 */
export async function downloadVideo(videoUrl: string): Promise<Buffer> {
  const res = await fetch(videoUrl, { signal: AbortSignal.timeout(120_000) });
  if (!res.ok) throw new Error(`Failed to download video from HeyGen (${res.status})`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
