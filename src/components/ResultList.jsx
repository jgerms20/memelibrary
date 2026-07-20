function SaveIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4Z" /></svg>;
}

export default function ResultList({ results, selectedId, onSelect, isSaved = () => false, onToggleSaved = () => {} }) {
  return (
    <div className="result-list" aria-label="Search results">
      {results.slice(0, 8).map((result, index) => {
        const saved = isSaved(result.item.id);
        const hasMatchScore = Number.isFinite(result.confidence);
        return (
          <div className={result.item.id === selectedId ? 'result-row is-selected' : 'result-row'} key={result.item.id}>
            <button
              className="result-select"
              type="button"
              onClick={() => onSelect(result.item.id)}
              aria-label={`Open ${result.item.title}`}
              aria-pressed={result.item.id === selectedId}
            >
              <span className="result-rank">{String(index + 1).padStart(2, '0')}</span>
              <span className="row-thumb">
                <img src={result.item.mediaUrl} alt="" loading="lazy" />
                <i>{result.item.mediaType}</i>
              </span>
              <span className="row-copy">
                <strong>{result.item.title}</strong>
                <small>{result.item.summary}</small>
              </span>
              <span className="row-score">{hasMatchScore ? `${result.confidence}% match` : 'Featured'}</span>
              <span className="row-open">Open</span>
            </button>
            <button
              className={saved ? 'row-save is-saved' : 'row-save'}
              type="button"
              onClick={() => onToggleSaved(result.item.id)}
              aria-label={`${saved ? 'Remove' : 'Save'} ${result.item.title} from results`}
              aria-pressed={saved}
            >
              <SaveIcon />
            </button>
          </div>
        );
      })}
    </div>
  );
}
