# Meme Library

Meme Library finds the exact meme, reaction image, GIF, video, or cultural clip you half remember. Search by quote, mood, clothing, visual detail, community, platform, or context, then inspect the media, verified source links, spread timeline, and lifecycle.

## What works

- Natural-language recall search across 649 source-linked records
- Real images, GIFs, privacy-enhanced YouTube playback, direct video, and verified public X embeds
- Platform, media, and community filters with dedicated Trending and Saved views
- Linked platform, creator, first-upload, capture, and current-status provenance
- Persistent light and dark themes
- Responsive desktop and mobile layouts

## Run it

```bash
npm install
npm run dev
```

Run the automated checks with `npm test -- --run` and build the production bundle with `npm run build`.

## Content note

Media stays on its public source host; Meme Library stores search metadata and source links. Archive accounts may be curators rather than original creators. A larger production release should add a rights-review queue, takedown handling, resilient media health checks, and a server-side multimodal ingestion pipeline.
