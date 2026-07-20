# Meme Library Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand Meme Atlas into a public Meme Library with 500+ real source-linked records, simplified search, themes, saved items, provenance links, platform filters, match explanations, and working navigation.

**Architecture:** Keep the React/Vite static deployment, generate a checked-in catalog snapshot with Node scripts, normalize canonical and feed-derived records behind one schema, and keep user state in localStorage. External media is embedded or rendered from its host with linked fallbacks.

**Tech Stack:** React 19, Vite 8, Vitest, Testing Library, browser QA, Vercel.

## Global Constraints

- Product name is “Meme Library.”
- The primary heading is “Find your meme.”
- The checked-in catalog contains at least 500 unique, non-NSFW records.
- External copyrighted media stays on its host and retains a source link.
- Light and dark mode are both required and persist user choice.
- Empty or unrelated searches never claim a confident match.

---

### Task 1: Generate and normalize the expanded catalog

**Files:**
- Create: `scripts/build-catalog.mjs`
- Create: `src/data/catalog.generated.json`
- Create: `src/data/catalog.js`
- Modify: `src/data/memes.js`
- Test: `src/data/catalog.test.js`

**Interfaces:**
- Produces: `catalog`, an array of normalized records with `id`, `title`, `mediaType`, `mediaUrl`, `sourceUrl`, `platform`, `creator`, `tags`, and provenance fields.

- [ ] Write tests asserting 500+ unique safe records and required URL/type fields.
- [ ] Run `npm test -- --run src/data/catalog.test.js` and confirm the missing catalog fails.
- [ ] Implement public-feed fetching, normalization, deduplication, and checked-in snapshot generation.
- [ ] Run the generator, then rerun the catalog test.
- [ ] Commit the catalog snapshot and generator.

### Task 2: Add theme and saved-state foundations

**Files:**
- Create: `src/hooks/useTheme.js`
- Create: `src/hooks/useSavedMemes.js`
- Create: `src/hooks/persistence.test.js`
- Modify: `src/styles/tokens.css`

**Interfaces:**
- Produces: `useTheme()` returning `{ theme, setTheme, toggleTheme }`.
- Produces: `useSavedMemes()` returning `{ savedIds, isSaved, toggleSaved }`.

- [ ] Write failing localStorage and system-theme tests.
- [ ] Implement persistent hooks and dark-theme tokens.
- [ ] Rerun the focused tests and commit.

### Task 3: Rebuild navigation and simplify search

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/SearchExperience.jsx`
- Create: `src/components/ThemeToggle.jsx`
- Create: `src/components/AboutPanel.jsx`
- Test: `src/components/SearchExperience.test.jsx`

**Interfaces:**
- Consumes: `catalog`, theme hook, and saved hook.
- Produces: hash-addressable Search, Trending, Saved, and About views.

- [ ] Update tests for product naming, heading, removed suggestion row, real nav targets, and theme toggle.
- [ ] Implement the simplified header/search and view routing.
- [ ] Rerun component tests and commit.

### Task 4: Add filters, saving, provenance, and match explanations

**Files:**
- Modify: `src/lib/search.js`
- Modify: `src/components/MemeDetails.jsx`
- Modify: `src/components/ResultList.jsx`
- Modify: `src/components/SourceTrail.jsx`
- Create: `src/components/MatchExplanation.jsx`
- Create: `src/components/FilterBar.jsx`
- Test: `src/lib/search.test.js`
- Test: `src/components/SearchExperience.test.jsx`

**Interfaces:**
- `searchMemes(query, items, filters)` accepts media/platform/community filters.
- Match results expose `matchedTerms` and `matchedFields` for explanation UI.

- [ ] Write failing tests for platform/community filtering, bookmark behavior, linked provenance, and explanation visibility.
- [ ] Implement deterministic filters and explanation metadata.
- [ ] Replace ambiguous arrows/trail language with working, labeled controls.
- [ ] Rerun tests and commit.

### Task 5: Support external video/GIF/X media and dated lifecycle labels

**Files:**
- Modify: `src/components/MediaViewer.jsx`
- Modify: `src/components/LifecycleChart.jsx`
- Modify: `src/styles/app.css`
- Test: `src/components/SearchExperience.test.jsx`

**Interfaces:**
- MediaViewer supports `image`, `gif`, `video`, `youtube`, and `x` records with source fallbacks.
- LifecycleChart accepts `startLabel`, `peakLabel`, and `nowLabel`.

- [ ] Write failing media-render and lifecycle-label tests.
- [ ] Implement the variants and responsive styling.
- [ ] Rerun focused tests and commit.

### Task 6: Verify, deploy, and test production

**Files:**
- Modify: `README.md`

- [ ] Run `npm test -- --run` and require zero failures.
- [ ] Run `npm run build` and `git diff --check`.
- [ ] Validate 500+ catalog media/source URLs with the verification script.
- [ ] Browser-test light/dark, save persistence, filters, match explanation, and media on desktop and mobile.
- [ ] Push the feature branch and deploy production to Vercel.
- [ ] Re-run the core browser workflow against the public alias.

