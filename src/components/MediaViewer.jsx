import { useState } from 'react';

function PlayIcon() {
  return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M11 7.5 25 16 11 24.5Z" /></svg>;
}

function MediaShell({ children, frameClass = '', label, sourceAction = null }) {
  return (
    <div className="media-shell">
      <div className={`media-frame ${frameClass}`.trim()}>{children}</div>
      <div className="media-meta">
        <span className="media-caption">{label}</span>
        {sourceAction}
      </div>
    </div>
  );
}

function mediaLabel(item) {
  return item.mediaLabel ?? (item.mediaType === 'gif'
    ? 'REACTION GIF'
    : item.mediaType === 'video'
      ? 'ORIGINAL VIDEO'
      : 'SOURCE IMAGE');
}

function isDirectVideoMedia(item) {
  return item.mediaType === 'video'
    && !item.youtubeId
    && (!item.embedUrl || /\.(?:mp4|webm|ogg|mov)(?:\?|$)/i.test(item.mediaUrl ?? ''));
}

export default function MediaViewer({ item }) {
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [directVideoFailed, setDirectVideoFailed] = useState(false);

  if (failed) {
    return (
      <div className="media-fallback" data-testid="media-fallback">
        <span>Preview unavailable</span>
        <strong>{item.title}</strong>
        <a href={item.sourceUrl} target="_blank" rel="noreferrer">Open source</a>
      </div>
    );
  }

  if (item.directVideoUrl && !directVideoFailed) {
    return (
      <MediaShell frameClass="media-video" label={mediaLabel(item)}>
        <video
          src={item.directVideoUrl}
          poster={item.posterUrl}
          controls
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setDirectVideoFailed(true)}
        >
          <track kind="captions" />
        </video>
      </MediaShell>
    );
  }

  if (item.youtubeId && playing) {
    return (
      <MediaShell frameClass="media-video" label={mediaLabel(item)}>
        <iframe
          title={`${item.title} video player`}
          src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}?autoplay=1&rel=0`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </MediaShell>
    );
  }

  if (isDirectVideoMedia(item)) {
    return (
      <MediaShell frameClass="media-video" label={mediaLabel(item)}>
        <video src={item.mediaUrl} controls muted loop playsInline preload="metadata" onError={() => setFailed(true)}>
          <track kind="captions" />
        </video>
      </MediaShell>
    );
  }

  if (item.embedUrl && !item.youtubeId) {
    const embedTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    const sourceAction = (
      <a className="embed-source" href={item.sourceUrl} target="_blank" rel="noreferrer">
        Embed not loading? Open {item.platform}
      </a>
    );
    return (
      <MediaShell frameClass="media-embed" label={mediaLabel(item)} sourceAction={sourceAction}>
        <div className="embed-fallback-copy"><strong>{item.title}</strong><span>Public post preview</span></div>
        <iframe
          title={`${item.title} post`}
          src={`${item.embedUrl}&theme=${embedTheme}`}
          loading="lazy"
          scrolling="no"
          allowFullScreen
        />
      </MediaShell>
    );
  }

  return (
    <MediaShell frameClass="media-still" label={mediaLabel(item)}>
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
    </MediaShell>
  );
}
