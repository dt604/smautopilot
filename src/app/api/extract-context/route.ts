import { NextRequest, NextResponse } from 'next/server';
import { scrapeUrl } from '@/lib/engine/scraper';
import { aggregateSignals } from '@/lib/engine/aggregator';
import { analyzeToBrandBrain } from '@/lib/engine/analyzer';
import { upsertBrandBrain } from '@/lib/engine/persistence';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/extract-context
 *
 * Accepts one or more URLs, scrapes them in parallel, aggregates the signals,
 * runs a single Gemini analysis pass, and persists the result to Supabase.
 *
 * Body (all forms supported):
 *   { "url": "https://brand.com", "user_id": "uuid" }
 *   { "urls": ["https://brand.com", "https://tiktok.com/@brand"], "user_id": "uuid" }
 *
 * Returns:
 *   { success: true, data: { brandBrain, business } }
 */
export async function POST(req: NextRequest) {
  // --- Parse & validate body ---
  let rawUrls: string[];
  let userId: string;

  try {
    const body = await req.json();

    // Accept both `url` (string) and `urls` (array) for flexibility
    if (body?.urls && Array.isArray(body.urls)) {
      rawUrls = body.urls.map((u: unknown) => String(u).trim()).filter(Boolean);
    } else if (body?.url && typeof body.url === 'string') {
      rawUrls = [body.url.trim()];
    } else {
      return NextResponse.json(
        { error: 'Missing required field: provide "url" (string) or "urls" (array).' },
        { status: 400 }
      );
    }

    if (rawUrls.length === 0) {
      return NextResponse.json({ error: 'At least one valid URL is required.' }, { status: 400 });
    }

    userId = body?.user_id?.trim();
    if (!userId) {
      return NextResponse.json({ error: 'Missing required field: user_id' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  // --- Step 1: Scrape all URLs in parallel ---
  // Use allSettled so one failing URL (e.g. a blocked social profile) doesn't
  // kill the entire request — we aggregate whatever succeeds.
  const scrapeResults = await Promise.allSettled(rawUrls.map(scrapeUrl));

  const successfulSignals = scrapeResults
    .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof scrapeUrl>>> =>
      r.status === 'fulfilled'
    )
    .map(r => r.value);

  const scrapeErrors = scrapeResults
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map((r, i) => ({ url: rawUrls[i], reason: r.reason?.message ?? 'Unknown error' }));

  if (successfulSignals.length === 0) {
    return NextResponse.json(
      {
        error: 'All URLs failed to scrape.',
        details: scrapeErrors,
      },
      { status: 502 }
    );
  }

  try {
    // --- Step 2: Aggregate signals from all successful scrapes ---
    const aggregated = aggregateSignals(successfulSignals);

    // --- Step 3: Single Gemini analysis pass over aggregated signals ---
    const brandBrain = await analyzeToBrandBrain(aggregated);

    // --- Step 4: Persist to Supabase (upsert by user_id + url) ---
    const business = await upsertBrandBrain(brandBrain, userId);

    return NextResponse.json({
      success: true,
      data: {
        brandBrain,
        business,
        // Surface any partial scrape failures so the frontend can show warnings
        warnings: scrapeErrors.length > 0 ? scrapeErrors : undefined,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[extract-context] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
