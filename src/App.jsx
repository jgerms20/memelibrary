import SearchExperience from './components/SearchExperience.jsx';
import { memes, suggestions } from './data/memes.js';

function GlobeMark() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="13" />
      <path d="M3 16h26M16 3c4 4 6 8.4 6 13s-2 9-6 13c-4-4-6-8.4-6-13s2-9 6-13Z" />
    </svg>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#search" aria-label="Meme Atlas home">
          <GlobeMark />
          <span>Meme Atlas</span>
          <b aria-hidden="true">*</b>
        </a>
        <nav aria-label="Primary navigation">
          <a className="is-active" href="#search">Search</a>
          <a href="#results">Collections</a>
          <a href="#about">About</a>
        </nav>
        <span className="version-mark">CURATED MVP · v1.0</span>
      </header>
      <SearchExperience items={memes} suggestions={suggestions} />
      <footer id="about">
        <p><strong>Meme Atlas</strong> remembers the internet with you.</p>
        <p>This first release searches a curated catalog. Sources stay linked to their original hosts.</p>
      </footer>
    </div>
  );
}
