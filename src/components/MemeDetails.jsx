import { useEffect, useState } from 'react';
import LifecycleChart from './LifecycleChart.jsx';
import MediaViewer from './MediaViewer.jsx';
import SourceTrail from './SourceTrail.jsx';

function ActionIcon({ type }) {
  if (type === 'save') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4Z" /></svg>;
  if (type === 'copy') return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="12" rx="1" /><path d="M5 16H4V4h11v1" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 20h16" /></svg>;
}

function FactLink({ href, children }) {
  return href ? <a href={href} target="_blank" rel="noreferrer">{children}</a> : children;
}

export default function MemeDetails({ result, compact = false, isSaved = false, onToggleSaved = () => {} }) {
  const { item, confidence, matchedTerms = [] } = result;
  const hasMatchScore = Number.isFinite(confidence);
  const [copyStatus, setCopyStatus] = useState('idle');
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    setCopyStatus('idle');
    setShowExplanation(false);
  }, [item.id]);

  async function copySource() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(item.sourceUrl);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  }

  if (compact) {
    return (
      <div className="facts-panel">
        <h2>About this meme</h2>
        <dl>
          <div><dt>Origin</dt><dd><FactLink href={item.sourceUrl}><span className="platform-badge">{item.originPlatform ?? item.platform}</span></FactLink></dd></div>
          <div><dt>Captured in</dt><dd>{item.capturedIn ?? item.location}</dd></div>
          <div><dt>First upload</dt><dd><FactLink href={item.firstUploadUrl}>{item.firstUpload}</FactLink></dd></div>
          <div><dt>Creator</dt><dd><FactLink href={item.creatorUrl}>{item.creator}</FactLink></dd></div>
          <div><dt>Peak</dt><dd>{item.peak}</dd></div>
          <div><dt>Where now</dt><dd>{item.nowStatus ?? 'Still circulating as searchable reaction shorthand.'}</dd></div>
          <div><dt>Indexed</dt><dd>{item.indexedAt}</dd></div>
        </dl>
        <div className="fact-section">
          <h3>Lifecycle</h3>
          <LifecycleChart values={item.lifecycle} title={item.title} labels={item.timelineLabels} />
        </div>
        <div className="fact-section">
          <h3>Microtags</h3>
          <div className="alias-list">{(item.microtags ?? item.tags).slice(0, 8).map((tag) => <span key={tag}>{tag}</span>)}</div>
        </div>
        <div className="fact-section">
          <h3>Use cases</h3>
          <ul>{item.useCases.map((useCase) => <li key={useCase}>{useCase}</li>)}</ul>
        </div>
      </div>
    );
  }

  return (
    <article className="selected-result">
      <div className="match-line">
        <span>{hasMatchScore ? 'Best match' : 'Featured'}</span>
        <strong>{hasMatchScore ? `${confidence}% match` : 'Catalog pick'}</strong>
      </div>
      <MediaViewer key={item.id} item={item} />
      <div className="selected-copy">
        <div className="title-line">
          <div>
            <span className="platform-badge">{item.platform}</span>
            <h2>{item.title}</h2>
            <p>{item.sourceKind ?? (item.mediaType === 'video' ? 'Original video' : item.mediaType === 'gif' ? 'Reaction GIF' : 'Source image')} · {item.firstUpload}</p>
          </div>
          <span className="mobile-confidence">{hasMatchScore ? `${confidence}% match` : 'Featured'}</span>
        </div>
        <div className="why-copy">
          <div className="why-heading">
            <h3>Why it fits</h3>
            <button type="button" aria-expanded={showExplanation} onClick={() => setShowExplanation((open) => !open)} aria-label="Explain this match">i</button>
          </div>
          <p>{item.why}</p>
          {showExplanation ? (
            <div className="match-explanation">
              <strong>Matched across descriptive tags</strong>
              <p>Search weighs quotes, visuals, emotions, contexts, aliases, communities, and microtags. {matchedTerms.length ? `Exact terms: ${matchedTerms.join(', ')}.` : 'This is a featured result from the open catalog.'}</p>
            </div>
          ) : null}
        </div>
        <div className="result-actions">
          <button className={isSaved ? 'is-saved' : ''} type="button" onClick={() => onToggleSaved(item.id)} aria-label={`${isSaved ? 'Remove' : 'Save'} ${item.title}`}>
            <ActionIcon type="save" /> {isSaved ? 'Saved' : 'Save'}
          </button>
          <button type="button" onClick={copySource} aria-live="polite">
            <ActionIcon type="copy" />
            {copyStatus === 'copied' ? 'Copied!' : copyStatus === 'failed' ? 'Copy failed' : 'Use this'}
          </button>
          <a href={item.downloadUrl ?? item.sourceUrl} target="_blank" rel="noreferrer">
            <ActionIcon type="download" /> {item.mediaType === 'image' ? 'Open image' : item.mediaType === 'gif' ? 'Open GIF' : 'Watch source'}
          </a>
        </div>
      </div>
      <div className="mobile-detail-extras">
        <SourceTrail item={item} />
        <details className="mobile-facts">
          <summary>Full provenance &amp; tags</summary>
          <MemeDetails result={result} compact />
        </details>
      </div>
    </article>
  );
}
