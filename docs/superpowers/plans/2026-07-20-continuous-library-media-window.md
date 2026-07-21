# Continuous Meme Library and Media Window Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand Meme Library to at least 1,000 searchable records, refresh it automatically every day, and render X videos and still images as clean, bounded media instead of scrollable social embeds.

**Architecture:** Keep the static Vite app and its zero-backend search index. Split curated X post metadata from generated direct-media metadata, refresh both the broad catalog and X media through deterministic Node scripts, and commit generated data from a scheduled GitHub Action so Vercel can publish the updated static build.

**Tech Stack:** React 18, Vite, Vitest, Node.js fetch and filesystem APIs, GitHub Actions, Vercel static hosting.

## Global Constraints

- Preserve the existing light and dark themes, persistent theme toggle, saved collections, provenance, search, and filters.
- The generated catalog must never shrink during a refresh and must contain at least 1,000 items after this expansion.
- The generated catalog is bounded at 5,000 records.
- X videos use direct public MP4 and poster URLs when available; the full X embed remains only as a fallback.
- Videos render in a fixed 16:9 window with native controls and no internal scrolling.
- Images and GIFs use `object-fit: contain` so the complete asset remains visible.
- A scheduled refresh must run tests and a production build before committing generated data.

---

### Task 1: Append-Preserving Catalog Refresh

**Files:**
- Modify: `scripts/build-catalog.mjs`
- Modify: `package.json`
- Test: `src/data/catalog.test.js`

**Interfaces:**
- Consumes: the existing `src/data/catalog.generated.json` array and Reddit/Imgflip source responses.
- Produces: `mergeCatalog(existing, incoming, maximum)` and a `catalog:refresh` npm script that writes a non-shrinking catalog of 1,000–5,000 unique records.

- [ ] **Step 1: Add a failing catalog invariant test**

Add assertions that the generated catalog contains at least 1,000 unique IDs, uses real source URLs, has parseable dynamic `indexedAt` values, and contains image, GIF, and video media types.

- [ ] **Step 2: Run the focused test and confirm the size assertion fails**

Run: `npm test -- --run src/data/catalog.test.js`

Expected: FAIL because the current catalog has fewer than 1,000 generated records.

- [ ] **Step 3: Implement resilient source collection and append-preserving merge**

In `scripts/build-catalog.mjs`, load the previous JSON when it exists, collect sources with `Promise.allSettled`, add relevant reaction and culture subreddits, deduplicate by stable ID and media URL, stamp the current UTC date, preserve older records when a source fails, and cap the result at 5,000 records. Throw if the merged output is smaller than the previous output or below 1,000 records.

- [ ] **Step 4: Add the refresh command and regenerate data**

Add `"catalog:refresh": "node scripts/build-catalog.mjs"` to `package.json`, then run `npm run catalog:refresh`.

Expected: `src/data/catalog.generated.json` contains between 1,000 and 5,000 unique records.

- [ ] **Step 5: Run the focused test and commit**

Run: `npm test -- --run src/data/catalog.test.js`

Expected: PASS.

Commit: `feat: expand append-preserving meme catalog`

### Task 2: Direct X Video Metadata Refresh

**Files:**
- Create: `src/data/xPosts.js`
- Create: `src/data/xMedia.generated.json`
- Create: `scripts/refresh-x-media.mjs`
- Modify: `src/data/xMemes.js`
- Modify: `package.json`
- Test: `src/data/xMemes.test.js`

**Interfaces:**
- Consumes: `X_POSTS`, an array of curated post descriptors containing `id`, `sourceUrl`, and editorial metadata.
- Produces: `src/data/xMedia.generated.json`, keyed by post ID with `{ videoUrl, posterUrl, verifiedAt }`, plus `xMemes` records exposing `directVideoUrl` and `posterUrl`.

- [ ] **Step 1: Write failing direct-media tests**

Assert that curated X videos include an HTTPS `video.twimg.com` MP4 when metadata exists, an HTTPS poster URL when available, and retain `embedUrl` for fallback.

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `npm test -- --run src/data/xMemes.test.js`

Expected: FAIL because current X records do not expose `directVideoUrl` or `posterUrl`.

- [ ] **Step 3: Split the post manifest and implement the refresher**

Move the 14 curated descriptors into `xPosts.js`. Implement `refresh-x-media.mjs` to fetch each public X post page, decode escaped URLs, select the largest discovered MP4 by pixel area, pair it with the post's thumbnail, retain the prior generated entry if extraction fails, and write stable formatted JSON.

- [ ] **Step 4: Merge generated media into curated records**

Update `xMemes.js` to map `X_POSTS` and `xMedia.generated.json` through the existing record helper, assigning `directVideoUrl`, `posterUrl`, and `verifiedAt` while preserving the X embed fallback.

- [ ] **Step 5: Refresh, test, and commit**

Run: `npm run x-media:refresh && npm test -- --run src/data/xMemes.test.js`

Expected: all focused tests pass and at least the verified public X posts have direct playable media.

Commit: `feat: resolve direct media for curated X videos`

### Task 3: Bounded Native Media Viewer

**Files:**
- Modify: `src/components/MediaViewer.jsx`
- Modify: `src/styles/app.css`
- Test: `src/components/MediaViewer.test.jsx`

**Interfaces:**
- Consumes: an item that may contain `directVideoUrl`, `posterUrl`, `youtubeId`, `mediaUrl`, or `embedUrl`.
- Produces: a single native media viewport labeled by media type, with the priority direct video, YouTube, direct media, X fallback embed, then still image.

- [ ] **Step 1: Write failing rendering tests**

Test that an X item with `directVideoUrl` renders a native `<video controls playsInline preload="metadata">` with a poster and does not render an iframe; test that a still image receives the contain-media class; test that fallback X items still render the embed.

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `npm test -- --run src/components/MediaViewer.test.jsx`

Expected: FAIL because direct X video metadata is not prioritized.

- [ ] **Step 3: Implement native rendering priority**

Update `MediaViewer.jsx` to prefer `directVideoUrl`, pass `poster`, keep source actions outside the player, and add media-type modifier classes. Do not nest scrollable elements inside the video viewport.

- [ ] **Step 4: Implement bounded CSS**

Make video and embeds use a 16:9 aspect ratio with overflow hidden. Give still images a bounded viewport and `object-fit: contain`; keep video `object-fit: contain`; reserve `object-fit: cover` only for decorative thumbnails.

- [ ] **Step 5: Test and commit**

Run: `npm test -- --run src/components/MediaViewer.test.jsx`

Expected: PASS.

Commit: `feat: render clean bounded meme media`

### Task 4: Daily Verified Refresh and Deployment

**Files:**
- Create: `.github/workflows/refresh-library.yml`
- Modify: `README.md`
- Test: `.github/workflows/refresh-library.yml`

**Interfaces:**
- Consumes: `npm run catalog:refresh`, `npm run x-media:refresh`, the repository branch, and Vercel project credentials.
- Produces: one daily and manually dispatchable refresh that commits changed generated files only after tests and `npm run build` pass, then deploys the production build.

- [ ] **Step 1: Add a failing workflow contract test**

Add a source-level test that checks the workflow declares `schedule` and `workflow_dispatch`, has `contents: write`, runs both refresh commands, runs tests and build before commit, and contains the production deploy step.

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test -- --run src/data/refreshWorkflow.test.js`

Expected: FAIL because the workflow does not exist.

- [ ] **Step 3: Add the workflow and operational documentation**

Create the workflow with checkout, Node 20, `npm ci`, both refresh commands, test, build, generated-file commit/push, and Vercel production deployment. Document the automated refresh, source constraints, and required repository secrets in `README.md`.

- [ ] **Step 4: Configure repository secrets without printing their values**

Use the authenticated GitHub and Vercel CLIs to set `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` for the repository. Verify only secret names with `gh secret list`.

- [ ] **Step 5: Test and commit**

Run: `npm test -- --run src/data/refreshWorkflow.test.js`

Expected: PASS.

Commit: `ci: refresh and publish meme library daily`

### Task 5: Full Verification and Public Release

**Files:**
- Modify only if verification exposes a defect: `src/**`, `scripts/**`, `.github/workflows/**`

**Interfaces:**
- Consumes: the finished app, tests, built assets, GitHub branch, and Vercel project.
- Produces: a verified production URL with search, saved items, themes, direct video playback, complete images, no internal media scroll, and an automated refresh workflow.

- [ ] **Step 1: Run static verification**

Run: `npm test -- --run && npm run build && git diff --check`

Expected: all tests pass, Vite builds successfully, and no whitespace errors are reported.

- [ ] **Step 2: Run desktop and mobile browser QA**

Verify search for `today drained me`, a direct X video's play/pause and progressing `currentTime`, a still image's natural dimensions, Saved persistence, theme persistence, media frame overflow, and document horizontal overflow at desktop and mobile widths.

- [ ] **Step 3: Push and deploy**

Push `codex/investor-mvp`, run a production Vercel deployment, and record the deployment and alias URLs.

- [ ] **Step 4: Verify production**

Repeat the key browser checks against the public alias and confirm HTTP 200 for the page, direct MP4, poster, and representative image.

- [ ] **Step 5: Request code review and finish the branch**

Review the final diff against the design, resolve high-confidence issues, and report the public URL plus exact verification evidence.
