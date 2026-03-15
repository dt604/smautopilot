import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL_ID = 'gemini-2.5-flash';

export interface TranscriptionResult {
  transcript: string;
  extracted_intent: string;
}

/**
 * Sends an audio buffer to Gemini 1.5 Pro for transcription and marketing
 * nuance extraction in a single multimodal pass.
 *
 * Returns both the raw transcript and a structured "extracted_intent" string
 * that captures the actionable marketing insight from the recording.
 *
 * @param audioBuffer - Raw audio bytes
 * @param mimeType - MIME type of the audio (e.g. 'audio/webm', 'audio/mp4')
 */
export async function transcribeAndExtractNuance(
  audioBuffer: Buffer,
  mimeType: string
): Promise<TranscriptionResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set in environment variables.');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_ID });

  const base64Audio = audioBuffer.toString('base64');

  const prompt = `You are a brand strategist analyzing a voice memo from a business owner or marketer.

Listen to this audio recording and respond with ONLY a valid JSON object (no markdown, no explanation):

{
  "transcript": "string — verbatim transcription of the audio",
  "extracted_intent": "string — 2-4 sentences capturing the core marketing nuance: what specific message, tone, slang, campaign idea, or content angle is the speaker trying to convey? Focus on what would make this useful for generating a viral UGC video script."
}`;

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: normalizeMimeType(mimeType),
        data: base64Audio,
      },
    },
    { text: prompt },
  ]);

  const text = result.response.text();
  return parseTranscriptionResponse(text);
}

/**
 * Browser MediaRecorder outputs 'audio/webm;codecs=opus'.
 * Gemini accepts 'audio/webm' — strip codec params.
 */
function normalizeMimeType(mimeType: string): string {
  return mimeType.split(';')[0].trim();
}

function parseTranscriptionResponse(text: string): TranscriptionResult {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (!parsed.transcript || !parsed.extracted_intent) {
      throw new Error('Missing required fields in Gemini response');
    }
    return {
      transcript: parsed.transcript,
      extracted_intent: parsed.extracted_intent,
    };
  } catch {
    throw new Error(`Gemini returned non-JSON transcription response:\n${text.slice(0, 500)}`);
  }
}
