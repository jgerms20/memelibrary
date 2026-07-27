# Meme Library Recall and Navigation V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a larger-feeling, safer, more searchable Meme Library with requested canonical records, shareable detail pages, transparent trending, stable saved navigation, and a reliable daily refresh.

**Architecture:** Preserve the dependency-light Vite/React static app and its local catalog. Add pure search/trending/safety helpers, a small hash router, focused view/filter components, and source-linked curated records with locally mirrored short media where reliability requires it. Keep deployment static and move expired Vercel credentials out of the scheduled refresh failure path.

**Tech Stack:** React 19, Vite 8, Vitest, Testing Library, Node.js refresh scripts, GitHub Actions, Vercel static hosting.

## Global Constraints

- Preserve visible persistent light and dark modes with system preference support.
- Media must render or play on the public deployment, with an original-source fallback.
- Do not include real-world death, graphic violence, raids, or traumatic news as entertainment memes.
- Do not require user check-ins during implementation.
- Keep the app static-host compatible.

---

### Task 1: Catalog safety and requested canonical records

**Files:**
- Modify: `src/data/catalog.test.js`
- Modify: `scripts/build-catalog.mjs`
- Create: `src/data/currentMemes.js`
- Modify: `src/data/memes.js`
- Create: `scripts/refresh-curated-media.mjs`
- Create: `scripts/curated-media.json`
- Modify: `package.json`
- Modify: `.github/workflows/refresh-library.yml`
- Create: `public/media/curated/*.mp4`

**Interfaces:**
- Produces: `isSafeCatalogRecord(record): boolean`, `currentMemes: MemeRecord[]`, and `npm run curated-media:refresh`.
- Consumes: existing `MemeRecord` shape and media fallback behavior.

- [ ] Write catalog tests asserting all four requested records exist and real-world violent-news fixtures are rejected while `Who Killed Hannibal?` remains allowed.
- [ ] Run `npm test -- --run src/data/catalog.test.js` and confirm the new assertions fail for missing records/filter.
- [ ] Add the pure safety predicate, filter stored and incoming records before merge, add canonical requested records with direct provenance, and add the resilient curated-media fetcher.
- [ ] Run the focused test and curated media refresh; confirm the media headers and source fallbacks are valid.
- [ ] Commit the catalog/safety slice.

### Task 2: Recall ranking, miss capture, and normalized trending

**Files:**
- Modify: `src/lib/search.test.js`
- Modify: `src/lib/search.js`
- Create: `src/lib/trending.test.js`
- Create: `src/lib/trending.js`
- Modify: `src/components/SearchExperience.test.jsx`
- Modify: `src/components/SearchExperience.jsx`

**Interfaces:**
- Produces: `searchMemes(query, items, facets)`, `rankTrending(items, now)`, and `catalogRequestUrl(query)`.
- Consumes: normalized discovery fields on every meme.

- [ ] Write failing tests for the four acceptance queries, small typos, strong partial descriptions, ranking separation, normalized trending reasons, and a request URL that preserves a miss.
- [ ] Run focused tests and verify expected failures.
- [ ] Implement phrase boosts, light word forms, character-trigram similarity, confidence calibration, transparent trending signals, and the miss-request link.
- [ ] Run focused tests and refactor while green.
- [ ] Commit the recall/trending slice.

### Task 3: Shareable detail routes and browseable results

**Files:**
- Modify: `src/App.test.jsx`
- Modify: `src/App.jsx`
- Create: `src/components/MemePage.jsx`
- Modify: `src/components/ResultList.jsx`
- Modify: `src/components/SearchExperience.test.jsx`
- Modify: `src/components/SearchExperience.jsx`

**Interfaces:**
- Produces: `#meme/<id>` routes, related meme links, and incremental result pagination.
- Consumes: `memes`, `MemeDetails`, `SourceTrail`, saved state, and search ranking.

- [ ] Write failing tests for direct detail loads, result links, browser-back-safe navigation, related records, and load-more beyond item eight.
- [ ] Run focused component tests and verify expected failures.
- [ ] Implement the hash route, detail view, semantic result links, and 24-at-a-time pagination.
- [ ] Run focused tests and refactor while green.
- [ ] Commit the routing/browse slice.

### Task 4: Filter and navigation redesign

**Files:**
- Modify: `src/components/SearchExperience.test.jsx`
- Create: `src/components/FilterBar.jsx`
- Modify: `src/components/SearchExperience.jsx`
- Modify: `src/App.test.jsx`
- Modify: `src/App.jsx`
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/app.css`

**Interfaces:**
- Produces: accessible Format/Source/Culture chips and stable `.nav-count` presentation.
- Consumes: existing filter state and `COMMUNITY_FACETS`.

- [ ] Write failing tests for `aria-pressed` filter chips and stable saved-count markup.
- [ ] Run focused tests and verify expected failures.
- [ ] Build the chip filter component, fix Saved layout, and redistribute the visual tokens across cobalt, vermilion, marigold, and teal in both themes.
- [ ] Run component tests and refactor while green.
- [ ] Commit the UI slice.

### Task 5: Refresh automation recovery

**Files:**
- Modify: `src/data/refreshWorkflow.test.js`
- Modify: `.github/workflows/refresh-library.yml`

**Interfaces:**
- Produces: a scheduled refresh whose success depends on collection, validation, build, and push—not an expired Vercel token.
- Consumes: Vercel Git integration or separate local production deployment.

- [ ] Write a failing workflow test asserting that scheduled refresh contains no Vercel token/CLI step and includes curated media refresh.
- [ ] Run the focused test and verify it fails against the current workflow.
- [ ] Remove the invalid deployment secret path, update Node/actions versions if supported, and preserve refresh/test/build/commit ordering.
- [ ] Run the focused test and refactor while green.
- [ ] Commit the automation slice.

### Task 6: Release verification and deployment

**Files:**
- Modify only if verification reveals a tested defect.

**Interfaces:**
- Produces: a verified public release at `https://meme-atlas.vercel.app/` and a successful manual refresh run.
- Consumes: all prior tasks.

- [ ] Run `npm test -- --run`, `npm run build`, `git diff --check`, media-header checks, and exact-query smoke checks.
- [ ] Review the complete diff for scope, safety, accessibility, and generated-file noise.
- [ ] Push the release branch, fast-forward `main`, and deploy the production build through the authenticated local Vercel project.
- [ ] Use the browser to verify desktop/mobile, light/dark, requested searches, detail URL, save badge, load more, and native media playback on production.
- [ ] Dispatch `Refresh Meme Library`, wait for completion, and verify the next run no longer fails after catalog push.
