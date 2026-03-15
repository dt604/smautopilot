/**
 * Ayrshare API client — Social Scheduling.
 *
 * Docs: https://docs.ayrshare.com/rest-api/endpoints/post
 *
 * Ayrshare handles OAuth with each social platform on their side.
 * We only need AYRSHARE_API_KEY in .env.local.
 */

import type { SocialPlatform } from './types';

const BASE = 'https://api.ayrshare.com/api';

export interface SchedulePostOptions {
  /** Public URL of the video file (must be HTTPS, directly accessible) */
  videoUrl: string;
  /** Caption / description — can be a single string for all platforms */
  caption: string;
  /** Target platforms */
  platforms: SocialPlatform[];
  /**
   * ISO 8601 UTC datetime to schedule the post.
   * If omitted or in the past, Ayrshare publishes immediately.
   */
  scheduledAt?: string;
}

export interface AyrsharePostResult {
  /** Ayrshare internal post ID — used to poll status via GET /api/post/{id} */
  ayrshare_post_id: string;
  /** Whether the post is scheduled (true) or published immediately (false) */
  isScheduled: boolean;
  /** Per-platform native post IDs (populated for immediate posts; empty for scheduled) */
  platformPostIds: Partial<Record<SocialPlatform, string>>;
}

export interface ConnectedPlatform {
  platform: SocialPlatform;
  connected: boolean;
  username?: string;
}

function getApiKey(): string {
  const key = process.env.AYRSHARE_API_KEY;
  if (!key) throw new Error('AYRSHARE_API_KEY is not set in environment variables.');
  return key;
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getApiKey()}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Schedules (or immediately publishes) a video to one or more social platforms.
 * Returns the Ayrshare post ID and per-platform native IDs.
 */
export async function schedulePost(options: SchedulePostOptions): Promise<AyrsharePostResult> {
  const body: Record<string, unknown> = {
    post: options.caption,
    platforms: options.platforms,
    mediaUrls: [options.videoUrl],
    isVideo: true,
  };

  if (options.scheduledAt) {
    body.scheduleDate = options.scheduledAt;
  }

  const res = await fetch(`${BASE}/post`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });

  const json = await res.json();

  if (!res.ok || json.status === 'error') {
    const message = json.message ?? json.errors?.[0]?.message ?? `Ayrshare error (${res.status})`;
    throw new Error(message);
  }

  // Build per-platform native ID map from the postIds array
  const platformPostIds: Partial<Record<SocialPlatform, string>> = {};
  if (Array.isArray(json.postIds)) {
    for (const entry of json.postIds) {
      if (entry.platform && entry.postId) {
        platformPostIds[entry.platform as SocialPlatform] = entry.postId;
      }
    }
  }

  return {
    ayrshare_post_id: json.id,
    isScheduled: json.status === 'scheduled',
    platformPostIds,
  };
}

/**
 * Fetches the current status of an Ayrshare post by its internal ID.
 * Useful for updating social_posts rows from 'scheduled' → 'posted'.
 */
export async function getPostStatus(ayrsharePostId: string): Promise<{
  status: string;
  platformPostIds: Partial<Record<SocialPlatform, string>>;
}> {
  const res = await fetch(`${BASE}/post/${encodeURIComponent(ayrsharePostId)}`, {
    headers: authHeaders(),
    signal: AbortSignal.timeout(10_000),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Ayrshare status check failed (${res.status}): ${json.message ?? ''}`);
  }

  const platformPostIds: Partial<Record<SocialPlatform, string>> = {};
  if (Array.isArray(json.postIds)) {
    for (const entry of json.postIds) {
      if (entry.platform && entry.postId) {
        platformPostIds[entry.platform as SocialPlatform] = entry.postId;
      }
    }
  }

  return { status: json.status, platformPostIds };
}

/**
 * Returns the social platforms connected to this Ayrshare account.
 * Used by the platform connection UI to show which accounts are live.
 */
export async function getConnectedPlatforms(): Promise<ConnectedPlatform[]> {
  const res = await fetch(`${BASE}/user`, {
    headers: authHeaders(),
    signal: AbortSignal.timeout(10_000),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Ayrshare user fetch failed (${res.status}): ${json.message ?? ''}`);
  }

  const SUPPORTED: SocialPlatform[] = ['tiktok', 'instagram', 'youtube'];
  const activePlatforms: string[] = json.activeSocialAccounts ?? [];

  return SUPPORTED.map((platform) => {
    const accountInfo = activePlatforms.find((p) => p.toLowerCase() === platform);
    return {
      platform,
      connected: !!accountInfo,
      username: json.profiles?.[platform]?.displayName ?? undefined,
    };
  });
}
