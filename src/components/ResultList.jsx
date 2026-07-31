function SaveIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4Z" /></svg>;
}

function mediaTypeLabel(type) {
  if (type === 'video') return 'Video';
  if (type === 'gif') return 'GIF';
  return 'Image';
}

export default function ResultList({ results, selectedId, isSaved = () => false, onToggleSaved = () => {} }) {
  return (
    <div className="result-list" aria-label="Search results">
      {results.map((result, index) => {
        const saved = isSaved(result.item.id);
        const hasMatchScore = Number.isFinite(result.confidence);
        return (
          <div className={result.item.id === selectedId ? 'result-row is-selected' : 'result-row'} key={result.item.id}>
            <a
              className="result-select"
              href={`#meme/${encodeURIComponent(result.item.id)}`}
              aria-label={`Open ${result.item.title}`}
              aria-current={result.item.id === selectedId ? 'page' : undefined}
            >
              <span className="result-rank">{String(index + 1).padStart(2, '0')}</span>
              <span className="row-thumb">
                <img src={result.item.mediaUrl} alt="" loading="lazy" />
                <i aria-label={mediaTypeLabel(result.item.mediaType)}>{mediaTypeLabel(result.item.mediaType)}</i>
              </span>
              <span className="row-copy">
                <strong>{result.item.title}</strong>
                <small>{result.item.summary}</small>
              </span>
              <span className="row-score">
                {hasMatchScore ? `${result.confidence}% match` : result.item.trendReasons?.[0] ?? 'Featured'}
              </span>
              <span className="row-open">Open</span>
            </a>
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
