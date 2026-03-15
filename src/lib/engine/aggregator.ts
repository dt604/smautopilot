import type { RawPageSignals } from './types';

/**
 * Merges signals from multiple scraped URLs into a single RawPageSignals object.
 * This lets Gemini see the full cross-source picture in one analysis pass,
 * which is more accurate and cheaper than multiple AI calls.
 *
 * Strategy:
 * - Primary URL (first in array) is used for title/meta.
 * - Headings, body text, colors, and social links are merged and deduplicated.
 * - Body text is capped at 6000 chars to stay within token budget.
 */
export function aggregateSignals(allSignals: RawPageSignals[]): RawPageSignals {
  if (allSignals.length === 0) {
    throw new Error('No signals to aggregate.');
  }

  if (allSignals.length === 1) {
    return allSignals[0];
  }

  const primary = allSignals[0];

  const mergedHeadings = dedup(allSignals.flatMap(s => s.headings)).slice(0, 30);
  const mergedColors = dedup(allSignals.flatMap(s => s.colorHints)).slice(0, 20);
  const mergedSocialLinks = dedup(allSignals.flatMap(s => s.socialLinks));

  // Prefix each source's body text with its URL so Gemini can attribute signals
  const mergedBodyText = allSignals
    .map(s => `[Source: ${s.url}]\n${s.bodyText}`)
    .join('\n\n---\n\n')
    .slice(0, 6000);

  // Best available description: prefer OG fields, fall back across sources
  const bestOgTitle = firstNonEmpty(allSignals.map(s => s.ogTitle));
  const bestOgDescription = firstNonEmpty(allSignals.map(s => s.ogDescription));
  const bestOgImage = firstNonEmpty(allSignals.map(s => s.ogImage));
  const bestMetaDescription = firstNonEmpty(allSignals.map(s => s.metaDescription));

  return {
    url: allSignals.map(s => s.url).join(', '),
    title: primary.title,
    metaDescription: bestMetaDescription,
    ogTitle: bestOgTitle,
    ogDescription: bestOgDescription,
    ogImage: bestOgImage,
    headings: mergedHeadings,
    bodyText: mergedBodyText,
    colorHints: mergedColors,
    socialLinks: mergedSocialLinks,
  };
}

function dedup<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

function firstNonEmpty(values: string[]): string {
  return values.find(v => v.trim().length > 0) ?? '';
}
