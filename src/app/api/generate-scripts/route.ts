import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateScripts } from '@/lib/engine/script-lab';
import type { BrandBrain, SavedScript } from '@/lib/engine/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/generate-scripts
 *
 * Fetches the brand's BrandBrain and optional voice memo intent from Supabase,
 * generates 3–5 viral UGC scripts via Gemini 1.5 Pro, and bulk-inserts them
 * into the `scripts` table as drafts.
 *
 * Body:
 *   {
 *     business_id: string       — UUID of the business
 *     voice_memo_id?: string    — optional UUID to layer in founder nuance
 *     count?: number            — number of scripts to generate (3–5, default 4)
 *   }
 *
 * Returns:
 *   { success: true, data: { scripts: SavedScript[] } }
 */
export async function POST(req: NextRequest) {
  let businessId: string;
  let voiceMemoId: string | undefined;
  let count: number;

  try {
    const body = await req.json();
    businessId = body?.business_id?.trim();
    voiceMemoId = body?.voice_memo_id?.trim() || undefined;
    count = Number(body?.count) || 4;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!businessId) {
    return NextResponse.json({ error: 'Missing required field: business_id' }, { status: 400 });
  }

  // --- Step 1: Fetch BrandBrain from businesses table ---
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('name, url, brand_voice, colors, value_props, metadata')
    .eq('id', businessId)
    .single();

  if (bizError || !business) {
    return NextResponse.json(
      { error: `Business not found: ${bizError?.message ?? 'No record'}` },
      { status: 404 }
    );
  }

  // Reconstruct BrandBrain from flat columns + metadata JSONB
  const brandBrain: BrandBrain = {
    name: business.name,
    url: business.url ?? '',
    brand_voice: business.brand_voice ?? '',
    colors: business.colors ?? { primary: 'unknown', secondary: 'unknown' },
    value_props: business.value_props ?? [],
    description: business.metadata?.description ?? '',
    target_audience: business.metadata?.target_audience ?? '',
    industry: business.metadata?.industry ?? '',
    products_services: business.metadata?.products_services ?? [],
    calls_to_action: business.metadata?.calls_to_action ?? [],
    social_handles: business.metadata?.social_handles ?? {},
  };

  // --- Step 2: Optionally fetch voice memo nuance ---
  let voiceMemoIntent: string | undefined;

  if (voiceMemoId) {
    const { data: memo, error: memoError } = await supabase
      .from('voice_memos')
      .select('extracted_intent')
      .eq('id', voiceMemoId)
      .eq('business_id', businessId) // ensure ownership
      .single();

    if (memoError || !memo) {
      return NextResponse.json(
        { error: `Voice memo not found: ${memoError?.message ?? 'No record'}` },
        { status: 404 }
      );
    }

    voiceMemoIntent = memo.extracted_intent ?? undefined;
  }

  // --- Step 3: Generate scripts via Gemini ---
  let generatedScripts;
  try {
    generatedScripts = await generateScripts({ brandBrain, voiceMemoIntent, count });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[generate-scripts] Gemini error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // --- Step 4: Bulk insert into scripts table ---
  const scriptType = voiceMemoId ? 'voice-led' : 'original';

  const rows = generatedScripts.map((script) => ({
    business_id: businessId,
    reference_id: voiceMemoId ?? null,
    title: script.title,
    content: JSON.stringify(script),
    script_type: scriptType,
    status: 'draft',
  }));

  const { data: savedRows, error: insertError } = await supabase
    .from('scripts')
    .insert(rows)
    .select('id, business_id, reference_id, title, content, script_type, status, created_at');

  if (insertError) {
    console.error('[generate-scripts] DB insert failed:', insertError.message);
    return NextResponse.json(
      { error: `Failed to save scripts: ${insertError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      scripts: savedRows as SavedScript[],
      // Also return parsed scripts so the frontend doesn't need to JSON.parse each content field
      parsed: generatedScripts,
    },
  });
}
