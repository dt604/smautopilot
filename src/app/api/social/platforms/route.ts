import { NextResponse } from 'next/server';
import { getConnectedPlatforms } from '@/lib/engine/ayrshare';

export const runtime = 'nodejs';

/**
 * GET /api/social/platforms
 *
 * Returns the connection status of TikTok, Instagram, and YouTube
 * for the Ayrshare account linked via AYRSHARE_API_KEY.
 *
 * Used by the Content Calendar UI to show which platforms are live
 * and disable scheduling for unconnected ones.
 *
 * Returns:
 *   { success: true, data: { platforms: ConnectedPlatform[] } }
 */
export async function GET() {
  try {
    const platforms = await getConnectedPlatforms();
    return NextResponse.json({ success: true, data: { platforms } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch platform status';
    console.error('[social/platforms] Ayrshare error:', message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
