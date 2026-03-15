import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';
import { transcribeAndExtractNuance } from '@/lib/engine/transcriber';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/voice-memo
 *
 * Accepts a multipart/form-data upload containing an audio recording.
 * Pipeline:
 *   1. Upload audio to Supabase Storage (voice-memos bucket)
 *   2. Transcribe + extract marketing nuance via Gemini 1.5 Pro
 *   3. Save result to the voice_memos table
 *
 * Form fields:
 *   audio       — audio file (webm, mp4, wav, etc.)
 *   business_id — UUID of the business this memo belongs to
 *
 * Returns:
 *   { success: true, data: { id, storage_path, transcript, extracted_intent, created_at } }
 */
export async function POST(req: NextRequest) {
  let formData: FormData;

  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid multipart form data.' }, { status: 400 });
  }

  const audioFile = formData.get('audio');
  const businessId = (formData.get('business_id') as string)?.trim();

  if (!audioFile || !(audioFile instanceof File)) {
    return NextResponse.json({ error: 'Missing required field: audio (File).' }, { status: 400 });
  }

  if (!businessId) {
    return NextResponse.json({ error: 'Missing required field: business_id.' }, { status: 400 });
  }

  // --- Step 1: Upload audio to Supabase Storage ---
  const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
  const mimeType = audioFile.type || 'audio/webm';
  const extension = mimeType.split('/')[1]?.split(';')[0] ?? 'webm';
  const fileName = `${businessId}/${Date.now()}.${extension}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('voice-memos')
    .upload(fileName, audioBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    console.error('[voice-memo] Storage upload failed:', uploadError.message);
    return NextResponse.json(
      { error: `Audio upload failed: ${uploadError.message}` },
      { status: 502 }
    );
  }

  const storagePath = uploadData.path;

  // --- Step 2: Transcribe + extract marketing nuance via Gemini ---
  let transcript: string;
  let extracted_intent: string;

  try {
    const result = await transcribeAndExtractNuance(audioBuffer, mimeType);
    transcript = result.transcript;
    extracted_intent = result.extracted_intent;
  } catch (err) {
    // Don't block persistence on transcription failure — save with empty fields
    // so the audio is not lost and can be retried.
    console.error('[voice-memo] Transcription failed:', err instanceof Error ? err.message : err);
    transcript = '';
    extracted_intent = '';
  }

  // --- Step 3: Save to voice_memos table ---
  const { data, error: dbError } = await supabase
    .from('voice_memos')
    .insert({
      business_id: businessId,
      storage_path: storagePath,
      transcript,
      extracted_intent,
    })
    .select('id, storage_path, transcript, extracted_intent, created_at')
    .single();

  if (dbError) {
    console.error('[voice-memo] DB insert failed:', dbError.message);
    return NextResponse.json(
      { error: `Failed to save voice memo record: ${dbError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      ...data,
      transcription_available: transcript.length > 0,
    },
  });
}
