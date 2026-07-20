import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App.jsx';

describe('App shell', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
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
    fireEvent.click(screen.getByRole('link', { name: /Saved/i }));
    expect(screen.getByRole('heading', { name: 'Your saved memes' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'About' }));
    expect(screen.getByRole('heading', { name: 'Built for fuzzy internet memory.' })).toBeInTheDocument();
  });
});
