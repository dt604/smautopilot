# SM Autopilot: Implementation Task List

## 🏗️ Phase 1: Foundation & Planning
- [x] Initial Brainstorming & Approach Selection
- [x] **System Architecture & Handoff**
    - [x] Create Implementation Plan
    - [x] Define Handoff Roles (Antigravity/Claude Coat)
    - [x] Incorporate Multi-Source Discovery logic
- [x] **Infrastructure Setup (Antigravity)**
    - [x] Initialize Next.js 15 Project (Tailwind, Framer Motion)
    - [x] Set up Supabase Project & Auth
    - [x] Draft Database Migrations (`brands`, `sources`, `media_uploads`, `scripts`)

## 🧠 Phase 2: The Engine Room (Claude Coat Lead)
- [ ] **Multimodal Ingestion Service**
    - [ ] Build scrapers for Websites & Social Profiles
    - [ ] Create **Multimodal Analyzers** for Images (Logo/Color) and PDFs (Product Specs)
    - [ ] Implement **Aggregator Logic** to merge 5+ different data types
- [ ] **Voice & Media Engine**
    - [ ] Implement Multi-Source Transcript fetcher (YouTube + Uploads + Voice)
    - [ ] Create "Nuance Extractor" to refine brand voice across all assets
- [ ] **Script Lab**
    - [ ] Integrate Gemini 1.5 Pro for viral script generation
    - [ ] Build Trending Sound/Topic matcher

## 🎬 Phase 3: Video Production & Scheduling
- [ ] **Video Generation Orchestrator**
    - [ ] Integrate HeyGen for Avatars
    - [ ] Integrate WaveSpeed for Product UGC
- [ ] **Social Pilot**
    - [ ] Integrate Ayrshare API for cross-platform posting
    - [ ] Build Scheduling & Calendar logic

## ✨ Phase 4: Frontend Polish (Antigravity Lead)
- [ ] **Dashboard Development**
    - [x] **Unified Ingester** (Multi-link input & Source management)
    - [ ] "Daily Pulse" Feed
    - [ ] YouTube Remix Studio
- [ ] **Final Review & Launch**
