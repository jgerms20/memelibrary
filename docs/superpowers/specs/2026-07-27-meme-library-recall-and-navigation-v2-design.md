# Meme Library Recall and Navigation V2 Design

## Outcome

Turn Meme Library from a promising archive into a dependable recall tool: exact cultural references should surface from imperfect descriptions, the catalog should feel as large as it is, every meme should be shareable on its own page, and the daily refresh should grow the library without sending false failure alerts.

The user's standing autonomous-execution instruction is treated as approval of this design so the release can be completed without a check-in.

## Product shape

### Search that tolerates human memory

Search keeps the fast local index, but ranking gains three missing signals: exact phrase and canonical alias boosts, typo-tolerant character similarity, and light word-form normalization. Curated records remain the highest-confidence layer because they contain quotes, visual details, emotions, contexts, communities, and provenance. Broad Reddit and template records supply long-tail recall.

Requested acceptance queries are first-class catalog records:

- `stepped on my damn toe`
- `somebody get these beggars out of here`
- `LeBron James` / `kid saying LeBron James`
- `Kanye tweet` / `Kanye Twitter screenshot`

An unmatched query should no longer dead-end. The empty state offers a prefilled GitHub catalog request that preserves exactly what the visitor typed, creating a durable ingestion queue without introducing a fragile backend.

### Browseable depth

The library already grows past 1,700 source-linked records, but only eight are visible. Results will initially show 24 and expose a clear load-more control. Match totals remain visible. This makes breadth legible while keeping rendering bounded.

### Shareable meme pages

Every result opens a static-host-safe hash route at `#meme/<id>`. The page carries the working media, save/use/source actions, provenance, lifecycle, tags, and related records. Direct loads and browser back navigation work on GitHub Pages or Vercel without server rewrites.

### Filters that feel like browsing, not form filling

The current platform and community dropdowns become visible chip groups labeled Format, Source, and Culture. Chips use `aria-pressed`, wrap on desktop, and scroll horizontally on narrow screens. Active state and counts remain obvious without opening a menu.

### Saved navigation that does not jump

The Saved label and count become a flex-aligned nav item with a fixed-size count badge. The badge is hidden at zero and never creates a second grid row, so saving an item cannot move the label.

### Transparent trending

Raw source-specific numbers are not comparable, so trending uses a normalized 100-point score:

- 45 points: discovery recency
- 35 points: logarithmically normalized source engagement
- 20 points: explicit editorial currency for verified current references

Only sources with meaningful freshness or engagement signals qualify. The page explains the formula and timestamp, while each result exposes its strongest reason. This is a discovery ranking, not a claim of universal internet popularity.

### Editorial safety

Political humor is permitted; real-world death, violent tragedy, graphic harm, raids, and dehumanizing news posts are excluded from the entertainment catalog. The ingestion filter evaluates title, summary, tags, and contexts before merge, and it also removes previously indexed violations. Fictional or canonical templates such as `Who Killed Hannibal?` remain allowed unless the record is describing real harm.

### Visual direction

Keep the editorial archive personality and full light/dark support, but stop using purple for every interaction. The new system uses:

- cobalt for links, focus, and information
- vermilion for primary actions and active navigation
- marigold for saved/highlight states
- teal for positive/trending signals
- ink and paper as the dominant surfaces

## Continuous operations

The refresh job continues to collect, validate, test, build, and push generated catalog data daily. The expired Vercel CLI secret is removed from the scheduled critical path; deployment becomes a separate best-effort step or uses the provider's Git integration. A catalog refresh must not be reported as failed after it already validated and pushed successfully.

The workflow tests enforce ordering, safety filtering, minimum catalog size, and deploy-step isolation. Local authenticated Vercel deployment remains the release path for this update.

## Verification gates

- Failing tests are written first for every behavior change.
- All unit/component/workflow tests pass.
- Production build succeeds.
- Requested phrases resolve to the intended record.
- Direct meme URLs load.
- Saved badge, filters, search, detail pages, both themes, and media are browser-verified on the deployed domain.
- The scheduled workflow is manually dispatched and completes successfully.
