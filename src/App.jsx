import { useEffect, useState } from 'react';
import SearchExperience from './components/SearchExperience.jsx';
import { memes } from './data/memes.js';
import { useSavedMemes } from './hooks/useSavedMemes.js';
import { useTheme } from './hooks/useTheme.js';

function LibraryMark() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M5 6h9v9H5zM18 6h9v9h-9zM5 19h9v7H5zM18 19h9v7h-9z" />
    </svg>
  );
}

function ThemeIcon({ theme }) {
  return theme === 'dark' ? (
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 15.4A8.2 8.2 0 0 1 8.6 4 8.2 8.2 0 1 0 20 15.4Z" /></svg>
  );
}

function AboutView({ onSearch }) {
  return (
    <main className="about-view" id="about">
      <p className="archive-label">ABOUT MEME LIBRARY</p>
      <h1>Built for fuzzy internet memory.</h1>
      <div className="about-grid">
        <article><span>01</span><h2>Describe anything</h2><p>Use a quote, outfit, person, mood, object, or what happens in the clip. The index searches all of those signals together.</p></article>
        <article><span>02</span><h2>Trace the source</h2><p>Every record keeps its platform, creator, first upload, capture context, and spread history linked wherever the public source allows.</p></article>
        <article><span>03</span><h2>Use it again</h2><p>Save favorites on this device and open the original image, video, GIF, post, or reference page when you need it.</p></article>
      </div>
      <div className="about-actions">
        <button className="about-cta" type="button" onClick={onSearch}>Find a meme</button>
        <a
          className="about-removal"
          href="https://github.com/jgerms20/memelibrary/issues/new?template=media-removal.yml"
          target="_blank"
          rel="noreferrer"
        >
          Report media or request removal
        </a>
      </div>
    </main>
  );
}

function viewFromHash() {
  const hash = window.location.hash.replace('#', '');
  return ['search', 'trending', 'saved', 'about'].includes(hash) ? hash : 'search';
}

export default function App() {
  const [view, setView] = useState(viewFromHash);
  const { theme, toggleTheme } = useTheme();
  const saved = useSavedMemes();

  useEffect(() => {
    const onHashChange = () => setView(viewFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  function go(nextView) {
    setView(nextView);
    window.location.hash = nextView;
    if (!navigator.userAgent.includes('jsdom')) window.scrollTo?.({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#search" onClick={() => go('search')} aria-label="Meme Library home">
          <LibraryMark />
          <span>Meme Library</span>
          <b aria-hidden="true">*</b>
        </a>
        <nav aria-label="Primary navigation">
          <a className={view === 'search' ? 'is-active' : ''} href="#search" onClick={() => go('search')}>Search</a>
          <a className={view === 'trending' ? 'is-active' : ''} href="#trending" onClick={() => go('trending')}>Trending</a>
          <a className={view === 'saved' ? 'is-active' : ''} href="#saved" onClick={() => go('saved')}>Saved <span>{saved.savedIds.length}</span></a>
          <a className={view === 'about' ? 'is-active' : ''} href="#about" onClick={() => go('about')}>About</a>
        </nav>
        <button
          className="theme-toggle"
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <ThemeIcon theme={theme} />
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
      </header>
      {view === 'about' ? (
        <AboutView onSearch={() => go('search')} />
      ) : (
        <SearchExperience
          items={memes}
          view={view}
          savedIds={saved.savedIds}
          isSaved={saved.isSaved}
          onToggleSaved={saved.toggleSaved}
        />
      )}
      <footer>
        <p><strong>Meme Library</strong> remembers the internet with you.</p>
        <p>{memes.length} source-linked images, GIFs, videos, and reaction posts.</p>
      </footer>
    </div>
  );
}
