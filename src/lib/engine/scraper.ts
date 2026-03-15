import * as cheerio from 'cheerio';
import type { RawPageSignals } from './types';

const SOCIAL_PATTERNS: Record<string, RegExp> = {
  instagram: /instagram\.com\/@?([\w.]+)/i,
  tiktok: /tiktok\.com\/@([\w.]+)/i,
  youtube: /youtube\.com\/@?([\w-]+)/i,
  twitter: /(?:twitter|x)\.com\/@?([\w]+)/i,
  linkedin: /linkedin\.com\/(?:company|in)\/([\w-]+)/i,
};

/** CSS color value pattern — catches hex, rgb, hsl */
const COLOR_PATTERN = /#[0-9a-f]{3,8}|rgb\([^)]+\)|hsl\([^)]+\)/gi;

/**
 * Fetches a URL and extracts raw page signals for AI analysis.
 * Uses a browser-like User-Agent to avoid bot blocks on common sites.
 */
export async function scrapeUrl(url: string): Promise<RawPageSignals> {
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

  const response = await fetch(normalizedUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${normalizedUrl}: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  return parseHtml(normalizedUrl, html);
}

function parseHtml(url: string, html: string): RawPageSignals {
  const $ = cheerio.load(html);

  // Remove noise nodes
  $('script, style, nav, footer, [aria-hidden="true"]').remove();

  const title = $('title').first().text().trim();
  const metaDescription = $('meta[name="description"]').attr('content')?.trim() ?? '';
  const ogTitle = $('meta[property="og:title"]').attr('content')?.trim() ?? '';
  const ogDescription = $('meta[property="og:description"]').attr('content')?.trim() ?? '';
  const ogImage = $('meta[property="og:image"]').attr('content')?.trim() ?? '';

  // Headings — h1 through h3, deduplicated
  const headingSet = new Set<string>();
  $('h1, h2, h3').each((_, el) => {
    const text = $(el).text().trim();
    if (text) headingSet.add(text);
  });

  // Body text — collapse whitespace, cap at 4000 chars to stay within token budget
  const bodyText = $('body')
    .text()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 4000);

  // Color hints from inline styles and style attributes
  const styleContent = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi)?.join(' ') ?? '';
  const inlineStyles = html.match(/style="[^"]*"/gi)?.join(' ') ?? '';
  const colorHints = [...new Set([...styleContent.matchAll(COLOR_PATTERN), ...inlineStyles.matchAll(COLOR_PATTERN)]
    .map(m => m[0])
    .filter(c => !isWhiteOrBlack(c))
    .slice(0, 20))];

  // Social links
  const socialLinks: string[] = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') ?? '';
    if (Object.values(SOCIAL_PATTERNS).some(re => re.test(href))) {
      socialLinks.push(href);
    }
  });

  return {
    url,
    title,
    metaDescription,
    ogTitle,
    ogDescription,
    ogImage,
    headings: [...headingSet].slice(0, 20),
    bodyText,
    colorHints,
    socialLinks: [...new Set(socialLinks)],
  };
}

/** Filter out near-white and near-black colors — not useful for brand palette */
function isWhiteOrBlack(color: string): boolean {
  const hex = color.replace('#', '');
  if (hex.length === 3 || hex.length === 6) {
    const full = hex.length === 3
      ? hex.split('').map(c => c + c).join('')
      : hex;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    const luminance = (r + g + b) / 3;
    return luminance < 20 || luminance > 235;
  }
  return false;
}
