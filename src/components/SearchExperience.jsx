import { useMemo, useState } from 'react';
import { searchMemes } from '../lib/search.js';
import MemeDetails from './MemeDetails.jsx';
import ResultList from './ResultList.jsx';
import SourceTrail from './SourceTrail.jsx';

const INITIAL_QUERY = 'orange cat playing a keyboard after someone fails';

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </svg>
  );
}

export default function SearchExperience({ items, suggestions }) {
  const [draftQuery, setDraftQuery] = useState(INITIAL_QUERY);
  const [activeQuery, setActiveQuery] = useState(INITIAL_QUERY);
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const results = useMemo(
    () => searchMemes(activeQuery, items, filter),
    [activeQuery, filter, items],
  );
  const selectedResult = results.find((result) => result.item.id === selectedId) ?? results[0];

  function runSearch(query) {
    const nextQuery = query.trim();
    setDraftQuery(nextQuery);
    setActiveQuery(nextQuery);
    setSelectedId(null);
  }

  function submitSearch(event) {
    event.preventDefault();
    runSearch(draftQuery);
  }

  function changeFilter(nextFilter) {
    setFilter(nextFilter);
    setSelectedId(null);
  }

  const best = selectedResult?.item;

  return (
    <main id="search">
      <section className="search-hero" aria-labelledby="search-heading">
        <p className="archive-label">CULTURAL MEMORY SEARCH ENGINE</p>
        <h1 id="search-heading">What are you trying to remember?</h1>
        <form className="search-form" role="search" onSubmit={submitSearch}>
          <label className="search-input-wrap">
            <span className="sr-only">Describe a meme, image, or video</span>
            <SearchIcon />
            <input
              type="search"
              value={draftQuery}
              onChange={(event) => setDraftQuery(event.target.value)}
              placeholder="Quote it, describe the outfit, the mood, or what happens…"
            />
          </label>
          <button className="find-button" type="submit">Find it</button>
        </form>
        <div className="suggestion-row" aria-label="Try these searches">
          <span>TRY THESE:</span>
          {suggestions.slice(0, 6).map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => runSearch(suggestion)}>
              {suggestion}
            </button>
          ))}
        </div>
      </section>

      <section className="workspace" id="results" aria-live="polite">
        {best ? (
          <>
            <aside className="trail-rail" aria-label="Selected meme source trail">
              <SourceTrail item={best} />
            </aside>
            <section className="result-stage">
              <div className="result-toolbar">
                <div className="filters" aria-label="Media type">
                  {['all', 'video', 'image'].map((option) => (
                    <button
                      key={option}
                      className={filter === option ? 'is-active' : ''}
                      type="button"
                      onClick={() => changeFilter(option)}
                    >
                      {option[0].toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
                <span>{results.length} curated matches</span>
              </div>
              <MemeDetails result={selectedResult} />
              <ResultList
                results={results}
                selectedId={best.id}
                onSelect={setSelectedId}
              />
            </section>
            <aside className="facts-rail" aria-label="About this meme">
              <MemeDetails result={selectedResult} compact />
            </aside>
          </>
        ) : (
          <div className="empty-state">
            <h2>No confident match yet.</h2>
            <p>Try a quote, what the person was wearing, the emotion, or one more visual detail.</p>
            {filter !== 'all' ? (
              <button type="button" onClick={() => changeFilter('all')}>Search all media</button>
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}
