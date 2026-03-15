/**
 * BrandBrain — the structured identity object extracted from a business URL.
 * Shape mirrors the `businesses` table in Supabase, extended with richer
 * signals captured during scraping that inform script generation.
 */
export interface BrandBrain {
  /** Business display name */
  name: string;

  /** Source URL that was scraped */
  url: string;

  /** One-sentence description of what the business does */
  description: string;

  /** The distilled brand voice / tone (e.g. "Bold, witty, Gen-Z friendly") */
  brand_voice: string;

  /** Core value propositions — what makes this brand worth talking about */
  value_props: string[];

  /** Primary and secondary brand colors extracted from the site */
  colors: {
    primary: string;
    secondary: string;
  };

  /** Target audience inferred from content and copy */
  target_audience: string;

  /** Industry / niche */
  industry: string;

  /** Key products or services mentioned */
  products_services: string[];

  /** Any CTAs or offers found (e.g. "Free trial", "Book a call") */
  calls_to_action: string[];

  /** Social handles found on the page */
  social_handles: Partial<Record<'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin', string>>;
}

/**
 * A single generated UGC script.
 * Stored as JSON.stringify(GeneratedScript) in the scripts.content TEXT column.
 */
export interface GeneratedScript {
  /** Short internal label for the script editor UI */
  title: string;
  /** The creative angle / framework (e.g. "Pain Point Hook", "Contrarian Take") */
  angle: string;
  /** First 3 seconds — the scroll-stopping opening line */
  hook: string;
  /** 15–45 second narrative body */
  body: string;
  /** Final 5-second call to action */
  cta: string;
  /** Estimated spoken duration in seconds */
  estimated_duration_seconds: number;
}

/** A script record as saved to the `scripts` Supabase table */
export interface SavedScript {
  id: string;
  business_id: string;
  reference_id: string | null;
  title: string;
  content: string; // JSON.stringify(GeneratedScript)
  script_type: 'original' | 'voice-led' | 'remix';
  status: 'draft' | 'approved' | 'rejected';
  created_at: string;
}

/** A video record as saved to the `videos` Supabase table */
export interface SavedVideo {
  id: string;
  script_id: string;
  heygen_job_id: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata: VideoMetadata;
  created_at: string;
}

export interface VideoMetadata {
  avatar_id: string;
  voice_id: string;
  avatar_style?: string;
  emotion?: string;
  background_color?: string;
  /** Supabase Storage path for the downloaded video file */
  storage_path?: string;
  /** Duration in seconds, returned by HeyGen on completion */
  duration_seconds?: number;
  error?: string;
}

/** Raw signals extracted from HTML before AI structuring */
export interface RawPageSignals {
  url: string;
  title: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  headings: string[];
  bodyText: string;
  /** Inline / stylesheet color values found on the page */
  colorHints: string[];
  socialLinks: string[];
}
