# 🚀 SM Autopilot: Project Handoff

Welcome to **SM Autopilot**, a content-as-a-service platform that transforms a business URL into a scheduled stream of premium AI-generated UGC videos.

## 👥 The Handoff Split

| Feature Area | Lead Agent | Responsibilities |
| :--- | :--- | :--- |
| **Frontend & Design** | **Antigravity** | Next.js 15, Tailwind, Framer Motion, Shadcn UI. Premium high-tech aesthetic. |
| **Data Architecture**| **Antigravity** | Supabase Schema (Auth, Postgres, Storage). |
| **The Scraper Engine** | **Claude Coat** | Deep-crawling **Websites & Social Profiles** (TikTok, FB, IG) + Multi-Source Transcription. |
| **The Script Lab** | **Claude Coat** | Script generation logic + **Competitor Remixing** & **Voice Memo AI processing**. |
| **Video Production** | **Claude Coat** | API Orchestration for HeyGen (Video Gen) and Ayrshare (Social Scheduling). |

---

## 🏗️ Technical Specifications (Claude's Questions)

1. **Project Structure**: Unified Next.js 15 repo located at `/Users/dan/Antigravity/SMAutomation`.
2. **Tech Stack**: 
   - **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS.
   - **Backend**: Supabase (Postgres, Storage, Auth).
   - **Language**: TypeScript throughout.
3. **Scope**: 
   - **Platforms**: TikTok, Instagram Reels, YouTube Shorts.
   - **Workflow**: Scrape (URL/Video/Voice) → AI Script Draft → User Approval → Render (HeyGen) → Schedule (Ayrshare).
4. **Secrets Manager**: Use `.env.local` for local development. We will use Ayrshare for social OAuth.
5. **AI Models**: Use **Gemini 1.5 Pro** for scripting/logic and **Whisper** (or Gemini Flash) for transcription tasks.

---

## 🛠️ Immediate First Tasks (Phase 1)

### 1. Project Scaffolding (Antigravity)
*   Initialize Next.js project with a premium design system.
*   Draft the Supabase relational schema (`businesses`, `scripts`, `voice_memos`, `competitors`).

### 2. The Engine Room (Claude Coat)
*   **Context Extractor**: Build the logic to turn a URL, Video, or Voice Memo into a structured "Brand Context" object.
*   **Script Lab PRO**: Implement the prompt engineering layer to turn "Context" + "Live Trend" into viral UGC scripts.

---

## 📝 Final Note for Claude Coat:
> "Claude, I'm setting up the 'Plumbing' and the 'Stage' (DB & UI). You are the 'Engine'. 
> Your first goal is to ensure that no matter what the user inputs—a URL, a competitor's YouTube video, or a quick voice thought—we can accurately extract the core value proposition and build a viral-ready script structure.
> 
> Good luck in the Engine Room!"
