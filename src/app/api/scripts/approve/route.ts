import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

/**
 * POST /api/scripts/approve
 * Body: { script_id: string }
 *
 * Marks a script as "approved", unlocking it for HeyGen rendering.
 * Called by the ScriptLab "Select for Production" button.
 */
export async function POST(req: NextRequest) {
  let scriptId: string;

  try {
    const body = await req.json();
    scriptId = body?.script_id?.trim();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!scriptId) {
    return NextResponse.json({ error: 'Missing required field: script_id' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('scripts')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', scriptId)
    .select('id, title, status')
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: `Failed to approve script: ${error?.message ?? 'Not found'}` },
      { status: error?.code === 'PGRST116' ? 404 : 500 }
    );
  }

  return NextResponse.json({ success: true, data });
}
