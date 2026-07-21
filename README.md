# Meme Library

Meme Library finds the exact meme, reaction image, GIF, video, or cultural clip you half remember. Search by quote, mood, clothing, visual detail, community, platform, or context, then inspect the media, verified source links, spread timeline, and lifecycle.

## What works

- Natural-language recall search across more than 1,000 source-linked records
- Real images, GIFs, privacy-enhanced YouTube playback, direct video, and bounded public X fallbacks
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

## Automatic library refresh

The production catalog refreshes every day through `.github/workflows/refresh-library.yml`, and it can also be started from GitHub Actions with **Run workflow**. The job preserves existing records, adds newly discovered source-linked posts up to the catalog cap, refreshes direct public media for curated X reactions, runs the complete test suite and production build, commits only changed generated data, and publishes the verified build to Vercel.

The workflow expects these GitHub Actions secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

To refresh locally, run `npm run catalog:refresh` and `npm run x-media:refresh`.

## Content note

Media stays on its public source host; Meme Library stores search metadata and source links. Archive accounts may be curators rather than original creators. A larger production release should add a rights-review queue, takedown handling, and a server-side multimodal ingestion pipeline.
