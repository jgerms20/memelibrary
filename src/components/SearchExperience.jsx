import { useEffect, useMemo, useState } from 'react';
import { searchMemes } from '../lib/search.js';
import { catalogRequestUrl, rankTrending } from '../lib/trending.js';
import FilterBar from './FilterBar.jsx';
import MemeDetails from './MemeDetails.jsx';
import ResultList from './ResultList.jsx';
import SourceTrail from './SourceTrail.jsx';

const PAGE_SIZE = 24;

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </svg>
  );
}

function options(items, key) {
  return [...new Set(items.map((item) => item[key]).filter(Boolean))].sort();
}

export default function SearchExperience({
  items,
  view = 'search',
  savedIds = [],
  isSaved = () => false,
  onToggleSaved = () => {},
}) {
  const [draftQuery, setDraftQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [filters, setFilters] = useState({ media: 'all', platform: 'all', community: 'all', provenance: 'all' });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const platformOptions = useMemo(() => options(items, 'platform'), [items]);
  const visibleItems = useMemo(() => {
    if (view === 'saved') return items.filter((item) => savedIds.includes(item.id));
    if (view === 'trending') {
      return rankTrending(items).map(({ item, trendScore, trendReasons }) => ({
        ...item,
        computedTrendScore: trendScore,
        trendReasons,
      }));
    }
    return items;
  }, [items, savedIds, view]);
  const results = useMemo(
    () => searchMemes(activeQuery, visibleItems, filters),
    [activeQuery, filters, visibleItems],
  );
  const selectedResult = results[0];
  const best = selectedResult?.item;
  const visibleResults = results.slice(0, visibleCount);
  const remainingCount = Math.max(0, results.length - visibleCount);

  useEffect(() => setVisibleCount(PAGE_SIZE), [view]);

  function runSearch(event) {
    event.preventDefault();
    setActiveQuery(draftQuery.trim());
    setVisibleCount(PAGE_SIZE);
  }

  function changeFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
    setVisibleCount(PAGE_SIZE);
  }

  const viewTitle = view === 'saved' ? 'Your saved memes' : view === 'trending' ? 'Trending now' : 'Find your meme.';
  const eyebrow = view === 'saved'
    ? 'YOUR PERSONAL SHELF'
    : view === 'trending'
      ? 'FRESH FROM THE FEED'
      : `SEARCH ${items.length.toLocaleString()} CULTURAL REFERENCES`;

  return (
    <main id="search">
      <section className="search-hero" aria-labelledby="search-heading">
        <p className="archive-label">{eyebrow}</p>
        <h1 id="search-heading">{viewTitle}</h1>
        <form className="search-form" role="search" onSubmit={runSearch}>
          <label className="search-input-wrap">
            <span className="sr-only">Describe a meme, image, or video</span>
            <SearchIcon />
            <input
              type="search"
              value={draftQuery}
              onChange={(event) => setDraftQuery(event.target.value)}
              placeholder="Describe the reaction, quote, person, or moment."
            />
          </label>
          <button className="find-button" type="submit">Find it</button>
        </form>
        {view === 'trending' ? (
          <aside className="trending-note" role="note" aria-label="How trending is ranked">
            <strong>Why these are trending</strong>
            <p>45% recency + 35% source engagement + 20% editorial verification. Signals refresh with each catalog update.</p>
          </aside>
        ) : null}
      </section>

      <section className="workspace" id="results">
        {best ? (
          <>
            <aside className="trail-rail" aria-label="How the selected meme spread">
              <SourceTrail item={best} />
            </aside>
            <section className="result-stage">
              <FilterBar filters={filters} platformOptions={platformOptions} resultCount={results.length} onChange={changeFilter} />
              <MemeDetails result={selectedResult} isSaved={isSaved(best.id)} onToggleSaved={onToggleSaved} />
              <ResultList results={visibleResults} selectedId={best.id} isSaved={isSaved} onToggleSaved={onToggleSaved} />
              {remainingCount ? (
                <div className="load-more-wrap">
                  <button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
                    Show {Math.min(PAGE_SIZE, remainingCount)} more
                  </button>
                  <span>{visibleResults.length.toLocaleString()} of {results.length.toLocaleString()}</span>
                </div>
              ) : null}
            </section>
            <aside className="facts-rail" aria-label="About this meme">
              <MemeDetails result={selectedResult} compact />
            </aside>
          </>
        ) : (
          <div className="empty-state">
            <h2>{view === 'saved' ? 'Nothing saved yet.' : 'No confident match yet.'}</h2>
            <p>{view === 'saved' ? 'Save a meme and it will stay on this device.' : 'Try a quote, outfit, emotion, platform, or one more visual detail.'}</p>
            {view === 'saved' ? <a className="empty-link" href="#search">Back to search</a> : null}
            {view !== 'saved' && activeQuery ? (
              <a className="catalog-request" href={catalogRequestUrl(activeQuery)} target="_blank" rel="noreferrer">Request this meme</a>
            ) : null}
            {Object.values(filters).some((value) => value !== 'all') ? (
              <button type="button" onClick={() => { setFilters({ media: 'all', platform: 'all', community: 'all', provenance: 'all' }); setVisibleCount(PAGE_SIZE); }}>Clear filters</button>
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}
