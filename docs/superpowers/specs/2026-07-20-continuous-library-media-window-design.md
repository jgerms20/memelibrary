# Meme Library Continuous Catalog and Media Window Design

## Decision

Meme Library will move from a one-time catalog snapshot to a continuously refreshed, append-preserving source index. X reaction posts will prefer direct public `video.twimg.com` media discovered from their linked public post, displayed in the same fixed media window as YouTube and direct video. The full X post embed remains a last-resort fallback only. Images and GIFs remain clean media-only previews with attribution and source actions outside the image.

The user explicitly delegated implementation decisions and asked for uninterrupted automatic execution. This document records the selected approach and approval basis before implementation.

## Approaches considered

1. **Append-preserving scheduled refresh plus runtime-safe snapshots — selected.** A Node generator fetches public reaction feeds, merges new safe records into the checked-in catalog without deleting healthy older records, refreshes direct media for curated X posts, runs tests, and commits changes on a daily GitHub Actions schedule. The checked-in snapshot keeps search fast and available even if upstream feeds fail.
2. **Live federated search on every query.** This would be freshest but makes core search dependent on cross-origin APIs, quotas, rate limits, and source outages. It is useful later as an optional supplement, not as the primary index.
3. **Download and rehost all media.** This would give maximum playback control but creates rights, storage, and takedown obligations that the current product is not prepared to manage.

## Catalog growth and refresh

- Each refresh loads the existing generated catalog first.
- It fetches safe public image, GIF, and video posts from reaction, meme, Black Twitter, TV/film, animal, wholesome, and current-culture communities.
- New records are normalized into the existing schema and merged by stable record ID and media URL.
- Existing healthy records are preserved; a temporarily unavailable feed cannot erase the library.
- NSFW, spoiler, malformed, and unsupported-media records are rejected.
- Duplicate media URLs are removed.
- The immediate refresh target is at least 1,000 generated records; subsequent refreshes may grow the catalog to a bounded 5,000-record snapshot.
- `indexedAt`, `lastVerifiedAt`, lifecycle labels, and the current year are generated from the actual refresh date rather than hard-coded dates.
- The refresh command is idempotent and fails before writing if the resulting catalog falls below the existing snapshot size or minimum safety/schema checks.

## Continuous delivery

- A GitHub Actions workflow runs daily and also supports manual dispatch.
- It installs locked dependencies, runs the catalog/X-media refresh, runs the full test suite and production build, and commits only verified generated-data changes.
- The workflow has explicit write permission for repository contents.
- Vercel production deployment runs after a verified refresh using repository secrets, preserving the current public alias.
- If any fetch, test, build, or deployment step fails, the last healthy production snapshot stays live.

## X media window

- Curated X records retain their canonical X post URL, creator link, date, tags, and provenance.
- The refresh script reads each public X post page and extracts its highest-resolution public `video.twimg.com` MP4 plus `pbs.twimg.com` poster image when available.
- A record with refreshed direct media renders as a native `<video>` with controls, `playsInline`, poster, metadata preload, and a fixed 16:9 viewport.
- The media window never contains a nested scrollbar.
- The X source action remains visible immediately below/over the window so attribution and the original post are always one click away.
- If direct media is missing or fails, the existing public X embed is used inside a bounded fallback panel with an always-visible “Open X post” action.

## Images and GIFs

- Images and GIFs render as only the media inside the preview frame: no social-post chrome, internal caption card, or scroll container.
- `object-fit: contain` is used so the complete image is visible; a neutral background fills unused space.
- Image source, creator, lifecycle, and save actions remain in the surrounding Meme Library details, not on top of the image.
- Broken media switches to the linked source fallback.

## Search and discovery

- The merged catalog remains searchable through the current deterministic title, alias, quote, visual, emotion, context, microtag, platform, and normalized-community index.
- Trending uses refreshed engagement scores and verification timestamps.
- The UI displays the actual total catalog size from the merged snapshot.
- The scheduled index intentionally augments, rather than replaces, the detailed canonical records.

## Error handling

- Upstream feed failure preserves the previous snapshot.
- Individual X extraction failure preserves that record and its embed/source fallback.
- Remote video failure exposes the original X post without trapping the user in a blank window.
- Automation does not commit when tests or the production build fail.
- Production deployment occurs only after verified generated data is committed.

## Verification

- Unit tests cover append-preserving catalog merges, dynamic refresh metadata, X direct-video preference, embed fallback, fixed media framing, and image-only rendering.
- Catalog tests require at least 1,000 generated safe records after the first expansion refresh.
- Production build and `git diff --check` must pass.
- Browser QA covers direct X video play/pause and visible frame change, YouTube playback, image-only framing, no nested media scrollbars, desktop/mobile overflow, and source-link access.
- The public Vercel alias is verified after deployment with visible content markers and browser interactions.
