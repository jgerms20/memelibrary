import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App.jsx';

function navigate(hash) {
  window.history.replaceState(null, '', hash);
  fireEvent(window, new Event('hashchange'));
}

describe('App shell', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState(null, '', '#search');
  });

  it('uses the Meme Library name and simple find-your-meme headline', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: 'Meme Library home' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Find your meme.' })).toBeInTheDocument();
    expect(screen.queryByText(/curated mvp/i)).not.toBeInTheDocument();
  });

  it('persists an explicit dark-mode choice', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('meme-library:theme')).toBe('dark');
  });

  it('opens working Saved and About views', () => {
    render(<App />);
    navigate('#saved');
    expect(screen.getByRole('heading', { name: 'Your saved memes' })).toBeInTheDocument();
    navigate('#about');
    expect(screen.getByRole('heading', { name: 'Built for fuzzy internet memory.' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Report media or request removal' })).toHaveAttribute(
      'href',
      expect.stringContaining('github.com/jgerms20/memelibrary/issues/new'),
    );
  });

  it('keeps the saved count in a separate stable badge', () => {
    render(<App />);
    const savedLink = screen.getByRole('link', { name: 'Saved' });
    expect(savedLink.querySelector('.nav-count')).toHaveClass('is-empty');

    fireEvent.click(screen.getAllByRole('button', { name: /^Save / })[0]);
    expect(savedLink.querySelector('.nav-count')).toHaveTextContent('1');
    expect(savedLink.querySelector('.nav-count')).not.toHaveClass('is-empty');
  });

  it('preserves recall context while opening a detail and returning', async () => {
    render(<App />);
    const search = screen.getByRole('searchbox');
    fireEvent.change(search, { target: { value: 'stepped on my damn toe' } });
    fireEvent.submit(search.closest('form'));
    fireEvent.click(screen.getByRole('button', { name: 'Motion' }));

    navigate('#meme/stepped-on-my-damn-toe');
    expect(await screen.findByRole('heading', { level: 1, name: 'Stepped on My Damn Toe' })).toBeInTheDocument();

    navigate('#search');
    expect(await screen.findByRole('searchbox')).toHaveValue('stepped on my damn toe');
    expect(screen.getByRole('button', { name: 'Motion' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('loads a shareable meme detail route directly', () => {
    window.history.replaceState(null, '', '#meme/damn-daniel');
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'Damn Daniel' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to search' })).toHaveAttribute('href', '#search');
    expect(screen.getByRole('link', { name: 'Watch source' })).toBeInTheDocument();
  });
});
