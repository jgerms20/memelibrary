export default function ResultList({ results, selectedId, onSelect }) {
  return (
    <div className="result-list" aria-label="Search results">
      {results.slice(0, 8).map((result, index) => (
        <button
          className={result.item.id === selectedId ? 'result-row is-selected' : 'result-row'}
          type="button"
          key={result.item.id}
          onClick={() => onSelect(result.item.id)}
          aria-label={`Open ${result.item.title}`}
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
          <span className="row-score">{result.confidence}% match</span>
          <svg className="row-arrow" viewBox="0 0 20 20" aria-hidden="true">
            <path d="m7 4 6 6-6 6" />
          </svg>
        </button>
      ))}
    </div>
  );
}
