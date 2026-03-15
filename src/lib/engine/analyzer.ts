import { GoogleGenerativeAI } from '@google/generative-ai';
import type { BrandBrain, RawPageSignals } from './types';

const MODEL_ID = 'gemini-2.5-flash';

/**
 * Sends raw page signals to Gemini 1.5 Pro and returns a structured BrandBrain.
 */
export async function analyzeToBrandBrain(signals: RawPageSignals): Promise<BrandBrain> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set in environment variables.');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_ID });

  const prompt = buildPrompt(signals);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return parseGeminiResponse(text, signals.url);
}

function buildPrompt(signals: RawPageSignals): string {
  return `You are a brand strategist and UGC content expert. Analyze the following web page data and extract a structured brand profile.

## Page Data
- **URL**: ${signals.url}
- **Title**: ${signals.title}
- **Meta Description**: ${signals.metaDescription}
- **OG Title**: ${signals.ogTitle}
- **OG Description**: ${signals.ogDescription}
- **Headings**: ${signals.headings.join(' | ')}
- **Body Text (excerpt)**: ${signals.bodyText}
- **Color Hints**: ${signals.colorHints.join(', ') || 'none detected'}
- **Social Links Found**: ${signals.socialLinks.join(', ') || 'none'}

## Instructions
Extract the brand profile and respond with ONLY a valid JSON object matching this exact schema (no markdown, no explanation):

{
  "name": "string — business name",
  "url": "string — source URL",
  "description": "string — one sentence: what does this business do?",
  "brand_voice": "string — tone and personality (e.g. 'Professional, warm, empowering')",
  "value_props": ["array of 3-5 core value propositions"],
  "colors": {
    "primary": "string — best guess hex color or 'unknown'",
    "secondary": "string — best guess hex color or 'unknown'"
  },
  "target_audience": "string — who is this for?",
  "industry": "string — industry or niche",
  "products_services": ["array of key products or services mentioned"],
  "calls_to_action": ["array of CTAs or offers found"],
  "social_handles": {
    "instagram": "handle or null",
    "tiktok": "handle or null",
    "youtube": "handle or null",
    "twitter": "handle or null",
    "linkedin": "handle or null"
  }
}`;
}

function parseGeminiResponse(text: string, url: string): BrandBrain {
  // Strip any accidental markdown fences
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    // Ensure url is always set from the original request
    return { ...parsed, url };
  } catch {
    throw new Error(`Gemini returned non-JSON response:\n${text.slice(0, 500)}`);
  }
}
