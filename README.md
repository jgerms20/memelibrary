# Meme Atlas

Meme Atlas is a visual search experience for finding the exact meme, reaction image, or cultural clip you half remember. Search by quote, mood, clothing, visual detail, or context, then inspect the original media, source trail, and cultural lifecycle.

## What works

- Natural-language search across quotes, aliases, emotions, visual details, and usage contexts
- Playable creator-hosted YouTube videos and directly rendered image sources
- Video and image filters, confidence-ranked alternatives, source trails, and lifecycle charts
- Responsive desktop and mobile layouts

## Run it

```bash
npm install
npm run dev
```

Run the automated checks with `npm test -- --run` and build the production bundle with `npm run build`.

## Content note

This investor MVP uses a small, curated catalog. Video playback points to creator or official YouTube uploads, and image entries retain source and attribution links. A production-scale release should add rights review, takedown handling, resilient media storage, and a multimodal ingestion pipeline before allowing downloads or broad redistribution.
