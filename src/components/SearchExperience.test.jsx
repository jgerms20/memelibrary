import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { memes } from '../data/memes.js';
import SearchExperience from './SearchExperience.jsx';

function renderExperience(props = {}) {
  return render(<SearchExperience items={memes} {...props} />);
}

describe('SearchExperience', () => {
  it('shows real media and a playable best match', () => {
    renderExperience();
    const search = screen.getByRole('searchbox');
    fireEvent.change(search, { target: { value: 'keyboard cat' } });
    fireEvent.submit(search.closest('form'));
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
      '/media/x/1554890639409545216.mp4',
    );
    expect(document.querySelector('video')).toHaveAttribute('controls');
    expect(screen.queryByTitle('Today Drained Me post')).not.toBeInTheDocument();
  });

  it('plays the verified original toe video rather than a sound reuse', () => {
    renderExperience();
    const search = screen.getByRole('searchbox');
    fireEvent.change(search, { target: { value: 'stepped on my damn toe' } });
    fireEvent.submit(search.closest('form'));
    expect(screen.getByRole('note', { name: 'Origin verification' })).toHaveTextContent(/confirmed original/i);
    fireEvent.click(screen.getByRole('button', { name: 'Play Stepped on My Damn Toe' }));
    expect(screen.getByTitle('Stepped on My Damn Toe video player')).toHaveAttribute(
      'src',
      expect.stringContaining('youtube-nocookie.com/embed/HwsFvtD31Bs'),
    );
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
    const search = screen.getByRole('searchbox');
    fireEvent.change(search, { target: { value: 'cat' } });
    fireEvent.submit(search.closest('form'));
    fireEvent.click(screen.getByRole('button', { name: 'Image' }));
    expect(screen.getByRole('heading', { name: 'Woman Yelling at a Cat' })).toBeInTheDocument();
    expect(screen.queryByText('Keyboard Cat', { selector: 'h2' })).not.toBeInTheDocument();
  });

  it('uses intentional media-type controls and filters video and GIF results separately from images', () => {
    renderExperience();
    expect(screen.getByRole('group', { name: 'Media type' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Video & GIF' }));
    expect(screen.getByRole('button', { name: 'Video & GIF' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('link', { name: 'Open Woman Yelling at a Cat' })).not.toBeInTheDocument();
    expect(screen.getAllByLabelText(/video|gif/i).length).toBeGreaterThan(0);
  });

  it('shows source-verification evidence and can limit results to confirmed originals', () => {
    renderExperience();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmed original' }));
    expect(screen.getByRole('button', { name: 'Confirmed original' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('note', { name: 'Origin verification' })).toHaveTextContent(/confirmed original/i);
  });

  it('filters the catalog with accessible platform and community chips', () => {
    renderExperience();
    fireEvent.click(screen.getByRole('button', { name: 'Reddit' }));
    expect(screen.getAllByText(/Reddit/i, { selector: '.platform-badge' }).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Black Twitter' }));
    expect(screen.getByRole('button', { name: 'Black Twitter' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByText(/Black Twitter/i).length).toBeGreaterThan(0);
  });

  it('links every result to a shareable detail route', () => {
    renderExperience();
    expect(screen.getByRole('link', { name: 'Open Woman Yelling at a Cat' })).toHaveAttribute(
      'href',
      '#meme/woman-yelling-cat',
    );
  });

  it('activates the privacy-enhanced player only after play', () => {
    renderExperience();
    const search = screen.getByRole('searchbox');
    fireEvent.change(search, { target: { value: 'keyboard cat' } });
    fireEvent.submit(search.closest('form'));
    fireEvent.click(screen.getByRole('button', { name: 'Play Keyboard Cat' }));
    const player = screen.getByTitle('Keyboard Cat video player');
    expect(player).toHaveAttribute('src', expect.stringContaining('youtube-nocookie.com/embed/J---aiyznGQ'));
  });

  it('keeps a useful source action when remote media fails', () => {
    renderExperience();
    const search = screen.getByRole('searchbox');
    fireEvent.change(search, { target: { value: 'keyboard cat' } });
    fireEvent.submit(search.closest('form'));
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
    const search = screen.getByRole('searchbox');
    fireEvent.change(search, { target: { value: 'keyboard cat' } });
    fireEvent.submit(search.closest('form'));
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
    expect(screen.getByRole('button', { name: 'TV & film' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Animals' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'TV / film' })).not.toBeInTheDocument();
  });

  it('shows 24 results initially and loads the rest on demand', () => {
    render(<SearchExperience items={memes.slice(0, 30)} />);
    const resultList = screen.getByLabelText('Search results');
    expect(within(resultList).getAllByRole('link')).toHaveLength(24);

    fireEvent.click(screen.getByRole('button', { name: 'Show 6 more' }));
    expect(within(resultList).getAllByRole('link')).toHaveLength(30);
  });

  it('explains the signals behind the trending view', () => {
    renderExperience({ view: 'trending' });
    expect(screen.getByRole('note', { name: 'How trending is ranked' })).toHaveTextContent(
      /45% recency.*35% source engagement.*20% editorial verification/i,
    );
    expect(screen.getByText(/\d+\/100 trend score/i)).toBeInTheDocument();
  });

  it('preserves a missed query in the catalog request link', () => {
    renderExperience();
    const search = screen.getByRole('searchbox');
    fireEvent.change(search, { target: { value: 'spaceship banana orchestra' } });
    fireEvent.submit(search.closest('form'));

    const request = screen.getByRole('link', { name: 'Request this meme' });
    expect(new URL(request.href).searchParams.get('body')).toContain('spaceship banana orchestra');
  });

  it('includes collapsible full provenance for mobile layouts', () => {
    renderExperience();
    expect(screen.getByText('Full provenance & tags')).toBeInTheDocument();
  });

  it('links origin, creator, and first upload while showing dated lifecycle labels', () => {
    renderExperience();
    const search = screen.getByRole('searchbox');
    fireEvent.change(search, { target: { value: 'keyboard cat' } });
    fireEvent.submit(search.closest('form'));
    expect(screen.getAllByRole('link', { name: 'YouTube' })[0]).toHaveAttribute('href', expect.stringContaining('youtube.com'));
    expect(screen.getAllByRole('link', { name: 'Charlie Schmidt' })[0]).toHaveAttribute('href', expect.stringContaining('youtube.com'));
    expect(screen.getAllByRole('link', { name: 'June 7, 2007' })[0]).toHaveAttribute('href', expect.stringContaining('youtube.com'));
    expect(screen.getAllByText('2007').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2009–2010').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2026').length).toBeGreaterThan(0);
  });
});
