import { useState } from 'react';

function PlayIcon() {
  return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M11 7.5 25 16 11 24.5Z" /></svg>;
}

export default function MediaViewer({ item }) {
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="media-fallback" data-testid="media-fallback">
        <span>Preview unavailable</span>
        <strong>{item.title}</strong>
        <a href={item.sourceUrl} target="_blank" rel="noreferrer">Open source</a>
      </div>
    );
  }

  if (item.embedUrl) {
    const embedTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    return (
      <div className="media-frame media-embed">
        <div className="embed-fallback-copy"><strong>{item.title}</strong><span>Public post preview</span></div>
        <iframe title={`${item.title} post`} src={`${item.embedUrl}&theme=${embedTheme}`} loading="lazy" allowFullScreen />
        <a className="embed-source" href={item.sourceUrl} target="_blank" rel="noreferrer">Embed not loading? Open {item.platform}</a>
      </div>
    );
  }

  if (item.youtubeId && playing) {
    return (
      <div className="media-frame">
        <iframe
          title={`${item.title} video player`}
          src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}?autoplay=1&rel=0`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  if (item.mediaType === 'video' && !item.youtubeId) {
    return (
      <div className="media-frame">
        <video src={item.mediaUrl} controls muted loop playsInline onError={() => setFailed(true)}>
          <track kind="captions" />
        </video>
        <span className="media-kind">VIDEO</span>
      </div>
    );
  }

  return (
    <div className="media-frame">
      <img
        src={item.mediaUrl}
        alt={item.mediaType === 'video' ? `${item.title} video thumbnail` : item.visual?.[0] ?? item.title}
        onError={() => setFailed(true)}
      />
      {item.youtubeId ? (
        <button className="play-button" type="button" aria-label={`Play ${item.title}`} onClick={() => setPlaying(true)}>
          <PlayIcon />
        </button>
      ) : null}
      <span className="media-kind">{item.mediaLabel ?? (item.mediaType === 'gif' ? 'REACTION GIF' : item.mediaType === 'video' ? 'ORIGINAL VIDEO' : 'SOURCE IMAGE')}</span>
    </div>
  );
}
