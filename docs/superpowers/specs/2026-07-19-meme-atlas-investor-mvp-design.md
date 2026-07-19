# Meme Atlas Investor MVP Design

## Goal

Ship a public, investor-demo-ready cultural-memory search engine that finds a recognizable meme, reaction image, movie still, or reaction video from vague natural-language recall and lets the user see or play the actual media.

## Product boundary

This release is a polished, honest curated MVP. Search runs locally against a deliberately rich seed catalog and does not claim to crawl the whole internet. Every item must have visible media, source metadata, aliases, usage guidance, and a lifecycle view. Internet-scale ingestion, account systems, social APIs, and automated rights clearance are later systems.

## Visual specification

Accepted visual references:

- `docs/concepts/meme-atlas-desktop.png` at 1435 x 1096
- `docs/concepts/meme-atlas-mobile.png` at 853 x 1844

The visual direction is a cultural-archive contact sheet crossed with a precise internet research tool.

### Tokens

- Archive paper: `#F8F8F4`
- Ink: `#141319`
- Ultraviolet: `#6750E8`
- Marigold: `#FFC857`
- Coral: `#FF6B6B`
- Sky: `#79C7FF`
- Positive: `#218A4D`
- Display: `Arial Narrow`, `Roboto Condensed`, compact system fallbacks
- Body: `Inter`, system sans fallbacks
- Utility: `IBM Plex Mono`, system monospace fallbacks

The background is a true neutral near-white, not cream. UI chrome uses thin ink rules, small radii, direct shadows only where hierarchy needs them, and visible keyboard focus.

### Layout

Desktop uses a quiet header, a large search-first opening, a source-trail rail, a dominant selected result, and a contextual facts column. Mobile stacks those regions, converts the source trail into a horizontal sequence, keeps a full-width 16:9 media frame, and shows the next result below the fold. No horizontal overflow is allowed.

### Signature

The source-trail ribbon connects original upload, remix era, meme formats, and brand use. It is functional context, not decoration.

## Core workflow

1. The initial screen is preloaded with a useful query and a playable best match.
2. The user can type a phrase, quote, visual detail, outfit, object, emotion, or usage scenario.
3. Search combines exact phrase, token, synonym, metadata-field, and phrase-prefix scores.
4. Results update with confidence, media type, why-it-fits copy, and visible media.
5. Selecting a result updates the player, source trail, origin facts, aliases, lifecycle graph, and actions.
6. Video items display a stable thumbnail first and load an embedded player only after the user presses play.
7. Image items display the actual remote image with a designed fallback if loading fails.
8. Source opens the canonical or best available public source in a new tab. Download saves the image when practical or opens the media source when cross-origin downloading is unavailable.

## Components and boundaries

- `src/data/memes.js`: curated catalog only.
- `src/lib/search.js`: deterministic normalization, synonym expansion, ranking, and confidence.
- `src/components/MediaViewer.jsx`: thumbnail, image, iframe activation, fallback, and media actions.
- `src/components/SearchExperience.jsx`: query, filters, suggestions, ranking, selection, and empty state.
- `src/components/SourceTrail.jsx`: original-to-remix lineage.
- `src/components/LifecycleChart.jsx`: accessible SVG trend visualization.
- `src/components/MemeDetails.jsx`: metadata, explanation, aliases, use cases, sources, and action buttons.
- `src/components/ResultList.jsx`: compact selectable results.
- `src/App.jsx`: composition only.

## Media reliability

YouTube-backed videos use `i.ytimg.com` thumbnails and privacy-enhanced `youtube-nocookie.com` embeds. Images use HTTPS source URLs and an `onError` fallback. The UI never depends on a remote asset to preserve layout. Verification includes HTTP checks for every thumbnail/image URL and browser playback activation for at least two videos.

## Error and empty states

- Failed media: preserve the frame, name the item, and provide a source button.
- No meaningful match: show the broadest catalog results plus specific search suggestions.
- Blocked embed: keep the thumbnail and offer `Watch source`.
- Offline/slow media: reserve aspect ratio and show a loading treatment without layout shift.

## Testing and acceptance

- Unit tests cover normalization, synonyms, exact quotes, visual descriptions, filters, and empty queries.
- Production build succeeds with no warnings that indicate broken imports or missing assets.
- Browser QA verifies search, suggestions, selection, video activation, source actions, and image display.
- Desktop is checked at 1435 x 1096 and mobile at 390 x 844, plus no horizontal overflow.
- Final visual QA compares screenshots to both concept images with a five-point fidelity ledger.
- The public Vercel URL returns HTTP 200 and the same core workflow works there.

## Deferred production systems

Automated internet crawling, multimodal embeddings, social-platform ingestion, rights/licensing workflows, user accounts, saved collections, and real trend analytics are intentionally outside this one-night MVP. The interface and data model leave clean seams for those systems without pretending they already exist.
