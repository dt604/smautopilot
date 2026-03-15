# 🤖 Collaborative Implementation Plan: AI Content Autopilot

This plan outlines a high-performance division of labor between **Antigravity** and **Claude Coat** to build the "URL-to-Scheduled-UGC" platform.

## 👥 Roles & Specializations

| Agent | Focus Area | Core Responsibilities |
| :--- | :--- | :--- |
| **Antigravity** (Me) | **The Architect & Pilot** | Frontend (Next.js), UI/UX, **File/Media Uploader UI**, Supabase Schema & Storage. |
| **Claude Coat** | **The Engine Room** | Scraping, **Multimodal Analysis** (OCR for images, video parsing, PDF extraction), API Orchestration. |

---

## 📅 Phased Roadmap

### Phase 1: The "Brain" & Onboarding
*Goal: Successfully analyze a URL and define the "Digital Twin" identity.*

*   **Antigravity**:
    *   Set up **Supabase** schema and **Storage Buckets** (`brands`, `sources`, `media_uploads`).
    *   Build the **Universal Asset Ingester** (Dropzone for URLs, Images, Videos, and PDFs).
*   **Claude Coat**:
    *   Implement **Multimodal Intelligence**: Analyzes uploaded images for brand colors/assets and parses PDFs/Videos for business value propositions.

### Phase 2: The "Remix" Studio & Trends
*Goal: Turn raw business data, competitor wins, and live trends into viral scripts.*

*   **Antigravity**:
    *   Build the **"Daily Pulse"** and **"Video Remix"** input UI.
    *   Design the **Script Editor UI** for comparing "Remixed" vs. "Voice-Led" vs. "Brand Original" scripts.
*   **Claude Coat**:
    *   Implement **Narrative Swap logic**: Injecting product features into competitor video structures.
    *   Refine scripts based on **voice memo intent** (capturing the user's specific nuance).

### Phase 3: The "Director" (Video Generation)
*Goal: Orchestrate the generation of the actual video files.*

*   **Antigravity**:
    *   Build the **"Video Preview" component** and the **Status Tracking UI**.
    *   Design the **Actor Selection UI** (interactive avatars/digital twins selection).
*   **Claude Coat**:
    *   Orchestrate the **HeyGen / WaveSpeed API** calls.
    *   Handle polling, file management, and storage in Supabase Buckets.

### Phase 4: The "Scheduler" (Social Posting)
*Goal: Connect social accounts and queue the posts.*

*   **Antigravity**:
    *   Build the **"Content Calendar"** and **Platform Preview** UIs.
    *   Implement the **Analytics Dashboard** for tracking performance.
*   **Claude Coat**:
    *   Integrate the **Ayrshare / Buffer APIs** and handle OAuth flows.
    *   Manage the actual background scheduling and posting logic.

---

## 🔄 The Collaborative Workflow

To work together efficiently, we will follow this handoff protocol:

1.  **Antigravity** builds the **`DB Table`** and the **`API Route`** (the "Plumbing").
2.  **Antigravity** notifies **Claude Coat**: *"Hey Claude, the `/api/generate-video` endpoint is live and accepts `scriptId` and `vibe`. Data is saved in the `videos` table."*
3.  **Claude Coat** builds the **`Frontend Component`** and hooks it up to the API (the "Interface").
4.  **Claude Coat** notifies **Antigravity**: *"Antigravity, the UI is done, but it needs a more reliable 'Render Progress' stream. Can you add a Webhook or Polling logic for that?"*

---

## 🛠️ Tech Stack Baseline
*   **Frontend**: Next.js 15, Tailwind CSS, Framer Motion (for those smooth premium transitions).
*   **Backend**: Supabase (Auth, Postgres, Storage, Edge Functions).
*   **Video APIs**: HeyGen (Avatars), WaveSpeed (E-commerce UGC).
*   **Social APIs**: Ayrshare (Posting).
*   **Intelligence**: Gemini 1.5 Pro (Orchestration & Scripts).

---

### 🚀 Next Steps
1.  **Antigravity**: I will start by initializing the **Next.js app** and the **Supabase schema**, ensuring the UI foundation is stunning from day one.
2.  **Claude Coat**: Should be tasked with building the **URL Scraper** and the **HeyGen integration** prototype.
