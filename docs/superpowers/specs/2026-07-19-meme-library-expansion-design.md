# Meme Library Catalog Expansion Design

## Decision

Meme Atlas becomes **Meme Library**: a source-first cultural media search product with a 500+ item launch catalog, persistent light and dark themes, saved items, clearer provenance, platform filtering, transparent search explanations, and working informational navigation.

The user delegated implementation choices and explicitly requested no further approval pauses. This document records the selected design before implementation.

## Approaches considered

1. **Source-first hybrid snapshot — selected.** Keep a checked-in catalog generated from public meme/reaction feeds, augment it with hand-curated canonical X, YouTube, and Wikimedia entries, and link every record to its original host. This is fast, testable, deployable without secrets, and safer than rehosting copyrighted media.
2. **Live federated search.** Query X, Reddit, Giphy, and other networks on every search. This would be fresher, but API keys, quotas, authentication, CORS, and service outages would make the investor demo unreliable.
3. **Copied media warehouse.** Download and serve every clip. This would maximize playback control but creates immediate copyright, takedown, storage, and attribution risk. It is inappropriate without a rights pipeline.

## Product language and navigation

- Product name: **Meme Library**.
- Primary heading: **Find your meme.**
- Search placeholder: **Describe the reaction, quote, person, or moment.**
- Navigation: Search, Trending, Saved, About, plus a visible theme toggle.
- Remove “Curated MVP,” “Try these,” and the ambiguous Collections label.
- The About link must navigate to a real explanation section.

## Search experience

Search indexes titles, quoted phrases, visual descriptions, emotions, situations, people, clothing, objects, cultural tags, platform, and community tags. Results retain deterministic confidence ranking and never manufacture a best match when there is no overlap.

Users may filter by:

- media: All, Video/GIF, Image;
- platform: All platforms, X, YouTube, Reddit, Imgflip, Wikimedia;
- community: Black Twitter, Stan Twitter, classic internet, TV/film, sports, animals, current/trending.

An information control beside the match score opens a plain-language explanation of which words and tags matched and how confidence is calculated.

## Catalog and ingestion

The catalog has three tiers:

1. Detailed canonical records for known cultural clips, including X posts requested by the user and existing YouTube/Wikimedia items.
2. A snapshot of the public Imgflip meme-template catalog.
3. A deduplicated snapshot of public reaction/meme posts surfaced by Meme_Api from reaction-focused, BlackPeopleTwitter, HighQualityGifs, memes, and wholesome communities.

Target: at least 500 playable/renderable records after deduplication and safety filtering. NSFW and spoiler records are excluded. Each record includes a stable ID, title, description/tags, media URL, source URL, platform, media type, creator/author when known, capture context, indexed date, and trend score when available.

Canonical X records use an embedded public post when playback is supported and always expose an “Open on X” fallback. External media remains on its source host.

## Provenance and detail model

Replace the location-like Origin field with:

- **Origin platform** — X, YouTube, Reddit, Instagram, TikTok, Tumblr, Wikimedia, or Imgflip;
- **Captured in** — city, show, event, or context only when known;
- **Creator** — linked profile/source attribution;
- **First upload** — linked original post with a real date when known;
- **Indexed** — snapshot date for feed-derived records;
- **Source** — linked canonical post or reference page.

Rename “Source Trail” to **How it spread**. Detailed canonical records show meaningful milestones. Feed-derived records show Source → Indexed → Trending/Community → Saved.

Lifecycle charts include visible start, peak, and current year/date labels. Curated records use their known timeline; feed-derived records use indexed date and relative engagement, explicitly labeled as library activity rather than historical Google Trends data.

## Saved items

Every result has a bookmark control. Saved IDs persist in `localStorage`, survive reloads, and appear in a dedicated Saved view. Users may remove saved items from either the result or Saved view. The empty Saved state links back to Search.

## Theme

Provide light, dark, and system-aware behavior. The first visit follows `prefers-color-scheme`; a manual selection persists in `localStorage`. Both themes use the existing editorial black/ivory/violet identity and maintain WCAG-readable contrast.

## Responsive behavior

Desktop retains the three-part research layout but reduces header/search noise. Mobile uses one clear search field, scrollable filter controls, a full-width media viewer, and collapsible provenance/details beneath the primary result.

## Error handling

- Broken images show a linked source fallback.
- Failed external embeds show an “Open on platform” card.
- Empty search results explain how to add one useful detail.
- Catalog-generation failures do not erase the last checked-in snapshot.
- Unsupported clipboard access reports failure instead of silently doing nothing.

## Verification

- Unit tests cover theme preference, saved persistence, filters, no-match behavior, match explanations, and catalog normalization.
- Catalog verification checks at least 500 safe unique records and validates required URLs/types.
- Production build must pass.
- Browser QA covers light/dark themes, desktop/mobile overflow, save/unsave persistence, platform filtering, explain-match, X/YouTube/image rendering, and live deployed navigation.

