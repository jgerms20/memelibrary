import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { memes, suggestions } from '../data/memes.js';
import SearchExperience from './SearchExperience.jsx';

function renderExperience() {
  return render(<SearchExperience items={memes} suggestions={suggestions} />);
}

describe('SearchExperience', () => {
  it('shows real media and a playable best match on first render', () => {
    renderExperience();
    expect(screen.getByRole('heading', { name: 'Keyboard Cat' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /keyboard cat video thumbnail/i })).toHaveAttribute(
      'src',
      expect.stringContaining('i.ytimg.com'),
    );
    expect(screen.getByRole('button', { name: 'Play Keyboard Cat' })).toBeInTheDocument();
  });

  it('finds a video from remembered objects and context', () => {
    renderExperience();
    const search = screen.getByRole('searchbox');
    fireEvent.change(search, { target: { value: 'dog getting excited about bacon' } });
    fireEvent.submit(search.closest('form'));
    expect(screen.getByRole('heading', { name: 'Ultimate Dog Tease' })).toBeInTheDocument();
  });

  it('runs a suggestion as a complete search', () => {
    renderExperience();
    fireEvent.click(screen.getByRole('button', { name: 'person overwhelmed by a rainbow' }));
    expect(screen.getByRole('heading', { name: 'Double Rainbow' })).toBeInTheDocument();
  });

  it('filters the catalog to image results', () => {
    renderExperience();
    fireEvent.click(screen.getByRole('button', { name: 'Image' }));
    expect(screen.getByRole('heading', { name: 'Woman Yelling at a Cat' })).toBeInTheDocument();
    expect(screen.queryByText('Keyboard Cat', { selector: 'h2' })).not.toBeInTheDocument();
  });

  it('updates the selected detail when a result row is chosen', () => {
    renderExperience();
    const result = screen.getByRole('button', { name: /open rickroll/i });
    fireEvent.click(result);
    expect(screen.getByRole('heading', { name: 'Rickroll' })).toBeInTheDocument();
    expect(screen.getByText(/bait-and-switch links/i)).toBeInTheDocument();
  });

  it('activates the privacy-enhanced player only after play', () => {
    renderExperience();
    fireEvent.click(screen.getByRole('button', { name: 'Play Keyboard Cat' }));
    const player = screen.getByTitle('Keyboard Cat video player');
    expect(player).toHaveAttribute('src', expect.stringContaining('youtube-nocookie.com/embed/J---aiyznGQ'));
  });

  it('keeps a useful source action when remote media fails', () => {
    renderExperience();
    const media = screen.getByRole('img', { name: /keyboard cat video thumbnail/i });
    fireEvent.error(media);
    const fallback = screen.getByTestId('media-fallback');
    expect(within(fallback).getByText('Preview unavailable')).toBeInTheDocument();
    expect(within(fallback).getByRole('link', { name: 'Open source' })).toHaveAttribute(
      'href',
      expect.stringContaining('youtube.com/watch'),
    );
  });

  it('shows an honest uncertainty state for an unrelated description', () => {
    renderExperience();
    const search = screen.getByRole('searchbox');
    fireEvent.change(search, { target: { value: 'spaceship banana orchestra' } });
    fireEvent.submit(search.closest('form'));
    expect(screen.getByRole('heading', { name: 'No confident match yet.' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Keyboard Cat' })).not.toBeInTheDocument();
  });

  it('labels cross-origin image actions accurately', () => {
    renderExperience();
    fireEvent.click(screen.getByRole('button', { name: 'Image' }));
    expect(screen.getByRole('link', { name: 'Open image' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Download' })).not.toBeInTheDocument();
  });

  it('confirms when a source link is copied', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    renderExperience();
    fireEvent.click(screen.getByRole('button', { name: 'Use this' }));
    expect(await screen.findByRole('button', { name: 'Copied!' })).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('youtube.com/watch'));
  });
});
