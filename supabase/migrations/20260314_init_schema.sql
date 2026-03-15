-- SM Autopilot: Initial Schema

-- 1. Businesses (The core identity)
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Links to auth.users
    name TEXT NOT NULL,
    url TEXT,
    brand_voice TEXT,
    colors JSONB, -- { primary: string, secondary: string }
    value_props TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb, -- Stores extended analysis (target_audience, niche, CTAs)
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT businesses_user_url_unique UNIQUE (user_id, url)
);

-- 2. Competitors & Creative References
CREATE TABLE IF NOT EXISTS creative_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    source_url TEXT NOT NULL,
    media_type TEXT, -- 'youtube', 'mp4', 'instagram'
    storage_path TEXT, -- If uploaded
    transcript TEXT,
    narrative_structure JSONB, -- { hook: text, body: text, cta: text }
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Voice Memos
CREATE TABLE IF NOT EXISTS voice_memos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    transcript TEXT,
    extracted_intent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Scripts (The AI Drafting Lab)
CREATE TABLE IF NOT EXISTS scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    reference_id UUID, -- Optional link to creative_reference or voice_memo
    title TEXT,
    content TEXT NOT NULL,
    script_type TEXT, -- 'original', 'remix', 'voice-led'
    status TEXT DEFAULT 'draft', -- 'draft', 'approved', 'rejected'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Videos (HeyGen Jobs)
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    script_id UUID REFERENCES scripts(id) ON DELETE CASCADE,
    heygen_job_id TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    metadata JSONB, -- { avatar_id: string, resolution: string, etc. }
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Social Posts (The Scheduler)
CREATE TABLE IF NOT EXISTS social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    platform TEXT NOT NULL, -- 'tiktok', 'instagram', 'youtube'
    caption TEXT,
    scheduled_at TIMESTAMPTZ,
    posted_at TIMESTAMPTZ,
    external_post_id TEXT, -- platform's native ID
    status TEXT DEFAULT 'scheduled', -- 'scheduled', 'posted', 'failed'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
