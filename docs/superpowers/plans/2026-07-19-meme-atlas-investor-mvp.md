# Meme Atlas Investor MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publicly deploy a polished Meme Atlas MVP with real visible images, playable video embeds, deterministic natural-language search, source context, and responsive investor-demo quality.

**Architecture:** A Vite React single-page application owns a curated media catalog and a deterministic weighted search module. Focused UI components render the selected item, source lineage, result list, and lifecycle details while keeping remote media failure-safe.

**Tech Stack:** React 19, Vite 7, Vitest, Testing Library, CSS, YouTube privacy-enhanced embeds, Vercel static hosting.

## Global Constraints

- Real thumbnails/images must be visible and video items must become playable.
- Search must match quotes, aliases, visual details, clothing, objects, emotion, and use context.
- The interface must disclose that the catalog is curated.
- Desktop and mobile must follow the accepted concept images.
- No fake internet-scale ingestion, analytics, or licensing claims.

---

### Task 1: Search engine and catalog

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`
- Create: `src/data/memes.js`
- Create: `src/lib/search.js`
- Test: `src/lib/search.test.js`

**Interfaces:**
- Produces: `searchMemes(query, items, filter)` returning ranked entries with `score`, `confidence`, and `matchedTerms`.

- [ ] Write tests for exact quote, alias, visual-description, synonym, filter, empty query, and zero-overlap behavior.
- [ ] Run `npm test -- --run src/lib/search.test.js` and confirm missing-module failure.
- [ ] Implement normalization, weighted fields, synonym expansion, phrase bonuses, and stable ranking.
- [ ] Add a media-rich seed catalog with source, lineage, lifecycle, and use metadata.
- [ ] Run the search tests and confirm all pass.

### Task 2: Search experience and media viewer

**Files:**
- Create: `src/main.jsx`, `src/App.jsx`
- Create: `src/components/SearchExperience.jsx`
- Create: `src/components/MediaViewer.jsx`
- Create: `src/components/ResultList.jsx`
- Create: `src/components/MemeDetails.jsx`
- Create: `src/components/SourceTrail.jsx`
- Create: `src/components/LifecycleChart.jsx`
- Test: `src/components/SearchExperience.test.jsx`

**Interfaces:**
- Consumes: `searchMemes` and catalog entries.
- Produces: a keyboard-accessible query, filter, selection, image, and video-playback workflow.

- [ ] Write interaction tests for initial result, query changes, suggestions, filters, result selection, video activation, and media fallback.
- [ ] Run the component tests and confirm failure before components exist.
- [ ] Implement the smallest accessible component structure that passes the workflow tests.
- [ ] Run all tests and confirm they pass.

### Task 3: Visual system and responsive fidelity

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/app.css`
- Modify: component files only where semantic class hooks are required.

**Interfaces:**
- Consumes: the accepted desktop and mobile concept images.
- Produces: responsive layouts at 1435 x 1096 and 390 x 844 with stable media framing and no overflow.

- [ ] Implement tokens, typography, header, search region, source ribbon, media stage, results, facts, focus, reduced motion, and mobile collapse.
- [ ] Run `npm run build` and fix any production errors.
- [ ] Capture desktop and mobile screenshots and compare them to both concepts.
- [ ] Repair every material mismatch and record a five-point fidelity ledger.

### Task 4: Media and public deployment

**Files:**
- Create: `vercel.json`, `README.md`
- Modify: `src/data/memes.js` only if validation finds unavailable media.

**Interfaces:**
- Produces: a public Vercel deployment and durable GitHub source branch.

- [ ] Verify every image/thumbnail URL returns usable content.
- [ ] Verify at least two video embeds activate in the browser and image fallback preserves the UI.
- [ ] Run the complete test suite, production build, and `git diff --check`.
- [ ] Commit, push `codex/investor-mvp`, and deploy the validated build to Vercel.
- [ ] Verify the public URL returns HTTP 200 and repeat the core search/media workflow against production.
