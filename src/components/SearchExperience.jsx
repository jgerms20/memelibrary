import { useMemo, useState } from 'react';
import { COMMUNITY_FACETS, searchMemes } from '../lib/search.js';
import MemeDetails from './MemeDetails.jsx';
import ResultList from './ResultList.jsx';
import SourceTrail from './SourceTrail.jsx';

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
  const [filters, setFilters] = useState({ media: 'all', platform: 'all', community: 'all' });
  const [selectedId, setSelectedId] = useState(null);
  const platformOptions = useMemo(() => options(items, 'platform'), [items]);
  const visibleItems = useMemo(() => {
    if (view === 'saved') return items.filter((item) => savedIds.includes(item.id));
    if (view === 'trending') return [...items].sort((a, b) => (b.trendScore ?? 0) - (a.trendScore ?? 0));
    return items;
  }, [items, savedIds, view]);
  const results = useMemo(
    () => searchMemes(activeQuery, visibleItems, filters),
    [activeQuery, filters, visibleItems],
  );
  const selectedResult = results.find((result) => result.item.id === selectedId) ?? results[0];
  const best = selectedResult?.item;

  function runSearch(event) {
    event.preventDefault();
    setActiveQuery(draftQuery.trim());
    setSelectedId(null);
  }

  function changeFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
    setSelectedId(null);
  }

  const viewTitle = view === 'saved' ? 'Your saved memes' : view === 'trending' ? 'Trending now' : 'Find your meme.';
  const eyebrow = view === 'saved' ? 'YOUR PERSONAL SHELF' : view === 'trending' ? 'FRESH FROM THE FEED' : 'SEARCH 600+ CULTURAL REFERENCES';

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
      </section>

      <section className="workspace" id="results">
        {best ? (
          <>
            <aside className="trail-rail" aria-label="How the selected meme spread">
              <SourceTrail item={best} />
            </aside>
            <section className="result-stage">
              <div className="result-toolbar">
                <div className="filters" aria-label="Search filters">
                  {['all', 'video', 'image'].map((option) => (
                    <button
                      key={option}
                      className={filters.media === option ? 'is-active' : ''}
                      type="button"
                      onClick={() => changeFilter('media', option)}
                    >
                      {option === 'video' ? 'Motion' : option[0].toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                  <label>
                    <span>Platform</span>
                    <select aria-label="Platform" value={filters.platform} onChange={(event) => changeFilter('platform', event.target.value)}>
                      <option value="all">All platforms</option>
                      {platformOptions.map((platform) => <option key={platform}>{platform}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Community</span>
                    <select aria-label="Community" value={filters.community} onChange={(event) => changeFilter('community', event.target.value)}>
                      <option value="all">All communities</option>
                      {COMMUNITY_FACETS.map((community) => <option key={community}>{community}</option>)}
                    </select>
                  </label>
                </div>
                <span aria-live="polite">{results.length} matches</span>
              </div>
              <MemeDetails result={selectedResult} isSaved={isSaved(best.id)} onToggleSaved={onToggleSaved} />
              <ResultList results={results} selectedId={best.id} onSelect={setSelectedId} isSaved={isSaved} onToggleSaved={onToggleSaved} />
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
            {Object.values(filters).some((value) => value !== 'all') ? (
              <button type="button" onClick={() => setFilters({ media: 'all', platform: 'all', community: 'all' })}>Clear filters</button>
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}
