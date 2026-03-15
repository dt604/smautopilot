import { GoogleGenerativeAI } from '@google/generative-ai';
import type { BrandBrain, GeneratedScript } from './types';

const MODEL_ID = 'gemini-1.5-pro';

// The five distinct viral angles we rotate through.
// Having named angles forces Gemini to produce genuinely different scripts
// rather than five minor variations of the same idea.
const VIRAL_ANGLES = [
  {
    name: 'Pain Point Hook',
    description:
      'Open with the audience\'s core frustration. Agitate it. Then reveal the brand as the obvious solution.',
  },
  {
    name: 'Contrarian Take',
    description:
      'Challenge a widely-held belief in the niche. Position the brand\'s approach as the smarter alternative.',
  },
  {
    name: 'Social Proof Story',
    description:
      'A before/after transformation told from the customer\'s POV. Lead with the result, then unpack the journey.',
  },
  {
    name: 'Day in the Life (POV)',
    description:
      'Immersive first-person POV. Put the viewer inside a moment where the product/service changes everything.',
  },
  {
    name: 'Value Bomb',
    description:
      'Lead immediately with the most useful tip, hack, or insight. The brand is the source of the knowledge — not a product pitch.',
  },
];

export interface ScriptLabInput {
  brandBrain: BrandBrain;
  /** Optional extracted intent from a voice memo to layer in personal nuance */
  voiceMemoIntent?: string;
  /** Number of scripts to generate (3–5) */
  count?: number;
}

/**
 * Generates 3–5 viral UGC scripts using Gemini 1.5 Pro.
 * Each script uses a distinct creative angle and is structured for
 * TikTok / Instagram Reels / YouTube Shorts (short-form vertical video).
 */
export async function generateScripts(input: ScriptLabInput): Promise<GeneratedScript[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set in environment variables.');

  const count = Math.min(Math.max(input.count ?? 4, 3), 5);
  const selectedAngles = VIRAL_ANGLES.slice(0, count);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL_ID,
    generationConfig: {
      temperature: 0.9, // Higher creativity for script writing
      topP: 0.95,
    },
  });

  const prompt = buildScriptPrompt(input, selectedAngles);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return parseScriptResponse(text, count);
}

function buildScriptPrompt(input: ScriptLabInput, angles: typeof VIRAL_ANGLES): string {
  const { brandBrain, voiceMemoIntent } = input;

  const voiceMemoSection = voiceMemoIntent
    ? `\n## Founder Voice Memo Intent\nThe founder recorded a voice note with this specific nuance to incorporate:\n"${voiceMemoIntent}"\nWeave this tone, language, or idea naturally into at least one script.`
    : '';

  const anglesFormatted = angles
    .map((a, i) => `${i + 1}. **${a.name}**: ${a.description}`)
    .join('\n');

  return `You are an elite UGC scriptwriter and viral content strategist specializing in short-form video for TikTok, Instagram Reels, and YouTube Shorts.

## Brand Brief

- **Brand**: ${brandBrain.name}
- **What they do**: ${brandBrain.description}
- **Brand Voice**: ${brandBrain.brand_voice}
- **Target Audience**: ${brandBrain.target_audience}
- **Industry**: ${brandBrain.industry}
- **Core Value Propositions**: ${brandBrain.value_props.join('; ')}
- **Key Products / Services**: ${brandBrain.products_services.join(', ')}
- **Primary CTA / Offer**: ${brandBrain.calls_to_action[0] ?? 'Learn more'}
${voiceMemoSection}

## Your Task

Write ${angles.length} distinct viral UGC video scripts. Each script must use a different creative angle listed below:

${anglesFormatted}

## Script Requirements

- **Hook**: 1–2 punchy sentences (first 3 seconds). Must create immediate curiosity, relatability, or tension. No slow intros.
- **Body**: The narrative (15–45 seconds of spoken content). Follow the angle's structure. Be conversational, not corporate. Use short sentences. Use the brand voice.
- **CTA**: 1 direct sentence (final 5 seconds). Action-oriented. Match the platform energy.
- **Estimated duration**: Estimate spoken seconds for the hook + body + CTA combined (assume ~130 words/min speaking pace).

## Output Format

Respond with ONLY a valid JSON array — no markdown, no explanation:

[
  {
    "title": "short internal label (5 words max)",
    "angle": "exact angle name from the list above",
    "hook": "the hook text",
    "body": "the full narrative body",
    "cta": "the call to action",
    "estimated_duration_seconds": 30
  }
]`;
}

function parseScriptResponse(text: string, expectedCount: number): GeneratedScript[] {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Gemini returned non-JSON script response:\n${text.slice(0, 500)}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Gemini script response was not a JSON array.');
  }

  const scripts = parsed as GeneratedScript[];

  if (scripts.length < 1) {
    throw new Error('Gemini returned an empty script array.');
  }

  // Validate required fields — surface clear errors if the model drifts
  scripts.forEach((s, i) => {
    for (const field of ['title', 'angle', 'hook', 'body', 'cta'] as const) {
      if (!s[field] || typeof s[field] !== 'string') {
        throw new Error(`Script[${i}] is missing or has an invalid field: "${field}"`);
      }
    }
    if (typeof s.estimated_duration_seconds !== 'number') {
      s.estimated_duration_seconds = 30; // safe fallback
    }
  });

  // Return up to expectedCount even if Gemini added extras
  return scripts.slice(0, expectedCount);
}
