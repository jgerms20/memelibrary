import { useEffect, useState } from 'react';
import LifecycleChart from './LifecycleChart.jsx';
import MediaViewer from './MediaViewer.jsx';
import SourceTrail from './SourceTrail.jsx';

function ActionIcon({ type }) {
  return type === 'bookmark' ? (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4Z" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 20h16" /></svg>
  );
}

export default function MemeDetails({ result, compact = false }) {
  const { item, confidence } = result;
  const [copyStatus, setCopyStatus] = useState('idle');

  useEffect(() => {
    setCopyStatus('idle');
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
          <div><dt>Origin</dt><dd>{item.location}</dd></div>
          <div><dt>First upload</dt><dd>{item.firstUpload}</dd></div>
          <div><dt>Creator</dt><dd>{item.creator}</dd></div>
          <div><dt>Peak</dt><dd>{item.peak}</dd></div>
        </dl>
        <div className="fact-section">
          <h3>Lifecycle</h3>
          <LifecycleChart values={item.lifecycle} title={item.title} />
        </div>
        <div className="fact-section">
          <h3>Aliases</h3>
          <div className="alias-list">{item.aliases.map((alias) => <span key={alias}>{alias}</span>)}</div>
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
        <span>Best match</span>
        <strong>{confidence}% match</strong>
      </div>
      <MediaViewer key={item.id} item={item} />
      <div className="selected-copy">
        <div className="title-line">
          <div>
            <h2>{item.title}</h2>
            <p>{item.sourceKind ?? (item.mediaType === 'video' ? 'Original video' : 'Source image')} · {item.firstUpload}</p>
          </div>
          <span className="mobile-confidence">{confidence}% match</span>
        </div>
        <div className="why-copy">
          <h3>Why it fits</h3>
          <p>{item.why}</p>
        </div>
        <div className="result-actions">
          <button type="button" onClick={copySource} aria-live="polite">
            <ActionIcon type="bookmark" />
            {copyStatus === 'copied' ? 'Copied!' : copyStatus === 'failed' ? 'Copy failed' : 'Use this'}
          </button>
          <a href={item.downloadUrl} target="_blank" rel="noreferrer">
            <ActionIcon type="download" /> {item.mediaType === 'image' ? 'Open image' : 'Watch source'}
          </a>
        </div>
      </div>
      <div className="mobile-detail-extras">
        <SourceTrail item={item} />
        <div className="mobile-lifecycle">
          <span>LIFECYCLE · PEAK {item.peak}</span>
          <LifecycleChart values={item.lifecycle} title={item.title} />
        </div>
      </div>
    </article>
  );
}
