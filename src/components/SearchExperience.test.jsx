import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { memes } from '../data/memes.js';
import SearchExperience from './SearchExperience.jsx';

function renderExperience(props = {}) {
  return render(<SearchExperience items={memes} {...props} />);
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

  it('finds and plays a requested X reaction video', () => {
    renderExperience();
    const search = screen.getByRole('searchbox');
    fireEvent.change(search, { target: { value: 'today drained me' } });
    fireEvent.submit(search.closest('form'));
    expect(screen.getByRole('heading', { name: 'Today Drained Me' })).toBeInTheDocument();
    expect(document.querySelector('video')).toHaveAttribute(
      'src',
      expect.stringContaining('video.twimg.com'),
    );
    expect(document.querySelector('video')).toHaveAttribute('controls');
    expect(screen.queryByTitle('Today Drained Me post')).not.toBeInTheDocument();
  });

  it('shows the live searchable library size', () => {
    renderExperience();
    expect(screen.getByText(`SEARCH ${memes.length.toLocaleString()} CULTURAL REFERENCES`)).toBeInTheDocument();
  });

  it('starts with a clean recall prompt instead of a prefilled example', () => {
    renderExperience();
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(screen.getByRole('searchbox')).toHaveAttribute(
      'placeholder',
      'Describe the reaction, quote, person, or moment.',
    );
    expect(screen.queryByText(/try these/i)).not.toBeInTheDocument();
  });

  it('filters the catalog to image results', () => {
    renderExperience();
    fireEvent.click(screen.getByRole('button', { name: 'Image' }));
    expect(screen.getByRole('heading', { name: 'Woman Yelling at a Cat' })).toBeInTheDocument();
    expect(screen.queryByText('Keyboard Cat', { selector: 'h2' })).not.toBeInTheDocument();
  });

  it('filters the catalog by platform and community', () => {
    renderExperience();
    fireEvent.change(screen.getByLabelText('Platform'), { target: { value: 'Reddit' } });
    expect(screen.getAllByText(/Reddit/i, { selector: '.platform-badge' }).length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText('Community'), { target: { value: 'Black Twitter' } });
    expect(screen.getAllByText(/Black Twitter/i).length).toBeGreaterThan(0);
  });

  it('updates the selected detail when a result row is chosen', () => {
    renderExperience();
    const result = screen.getByRole('button', { name: 'Open Woman Yelling at a Cat' });
    fireEvent.click(result);
    expect(screen.getByRole('heading', { name: 'Woman Yelling at a Cat' })).toBeInTheDocument();
    expect(screen.getByText(/angry woman pointing at a white cat/i)).toBeInTheDocument();
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

  it('explains why the match ranked and how tagging works', () => {
    renderExperience();
    fireEvent.click(screen.getByRole('button', { name: 'Explain this match' }));
    expect(screen.getByText(/matched across descriptive tags/i)).toBeInTheDocument();
    expect(screen.getByText(/quotes, visuals, emotions, contexts/i)).toBeInTheDocument();
  });

  it('saves the selected meme through the provided saved-state action', () => {
    const onToggleSaved = vi.fn();
    renderExperience({ onToggleSaved, isSaved: () => false });
    fireEvent.click(screen.getByRole('button', { name: 'Save Keyboard Cat' }));
    expect(onToggleSaved).toHaveBeenCalledWith('keyboard-cat');
  });

  it('offers a save control on every visible result row', () => {
    const onToggleSaved = vi.fn();
    renderExperience({ onToggleSaved, isSaved: () => false });
    fireEvent.click(screen.getByRole('button', { name: 'Save Damn Daniel from results' }));
    expect(onToggleSaved).toHaveBeenCalledWith('damn-daniel');
  });

  it('uses normalized community facets, including animals', () => {
    renderExperience();
    expect(screen.getByRole('option', { name: 'TV & film' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Animals' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'TV / film' })).not.toBeInTheDocument();
  });

  it('includes collapsible full provenance for mobile layouts', () => {
    renderExperience();
    expect(screen.getByText('Full provenance & tags')).toBeInTheDocument();
  });

  it('links origin, creator, and first upload while showing dated lifecycle labels', () => {
    renderExperience();
    expect(screen.getAllByRole('link', { name: 'YouTube' })[0]).toHaveAttribute('href', expect.stringContaining('youtube.com'));
    expect(screen.getAllByRole('link', { name: 'Charlie Schmidt' })[0]).toHaveAttribute('href', expect.stringContaining('youtube.com'));
    expect(screen.getAllByRole('link', { name: 'June 7, 2007' })[0]).toHaveAttribute('href', expect.stringContaining('youtube.com'));
    expect(screen.getAllByText('2007').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2009–2010').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2026').length).toBeGreaterThan(0);
  });
});
