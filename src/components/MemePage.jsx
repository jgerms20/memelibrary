import MemeDetails from './MemeDetails.jsx';

function relatedMemes(item, items) {
  const peers = items.filter((candidate) => candidate.id !== item.id && candidate.community === item.community);
  return peers.slice(0, 6);
}

export default function MemePage({ item, items, returnView = 'search', isSaved = () => false, onToggleSaved = () => {} }) {
  const returnLabel = returnView === 'search' ? 'search' : returnView;
  const returnHref = `#${returnView}`;
  if (!item) {
    return (
      <main className="meme-page meme-not-found">
        <p className="archive-label">MEME LIBRARY</p>
        <h1>Meme not found</h1>
        <p>That link does not match a record in the current library.</p>
        <a className="detail-back" href={returnHref}>Back to {returnLabel}</a>
      </main>
    );
  }

  const related = relatedMemes(item, items);
  const result = { item, confidence: null, matchedTerms: [] };

  return (
    <main className="meme-page">
      <header className="meme-page-header">
        <a className="detail-back" href={returnHref}>Back to {returnLabel}</a>
        <p className="archive-label">MEME RECORD · {item.platform}</p>
        <h1>{item.title}</h1>
        <p>{item.summary}</p>
      </header>
      <section className="meme-page-record" aria-label={`${item.title} media and provenance`}>
        <div className="meme-page-primary">
          <MemeDetails
            result={result}
            isSaved={isSaved(item.id)}
            onToggleSaved={onToggleSaved}
          />
        </div>
        <aside className="meme-page-facts" aria-label="Full meme provenance">
          <MemeDetails result={result} compact />
        </aside>
      </section>
      {related.length ? (
        <section className="related-memes" aria-labelledby="related-heading">
          <div>
            <p className="archive-label">KEEP BROWSING</p>
            <h2 id="related-heading">Related references</h2>
          </div>
          <div className="related-grid">
            {related.map((candidate) => (
              <a key={candidate.id} href={`#meme/${encodeURIComponent(candidate.id)}`}>
                <img src={candidate.mediaUrl} alt="" loading="lazy" />
                <span>{candidate.title}</span>
                <small>{candidate.platform}</small>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
