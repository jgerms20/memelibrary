import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MediaViewer from './MediaViewer.jsx';

const baseItem = {
  id: 'reaction-video',
  title: 'Today Drained Me',
  platform: 'X',
  sourceUrl: 'https://x.com/allreactionvids/status/1554890639409545216',
  mediaType: 'video',
  mediaUrl: 'https://example.com/fallback.jpg',
  mediaLabel: 'REACTION VIDEO',
};

describe('MediaViewer', () => {
  it('prefers a native player for a resolved X video', () => {
    const { container } = render(
      <MediaViewer
        item={{
          ...baseItem,
          directVideoUrl: 'https://video.twimg.com/example.mp4',
          posterUrl: 'https://pbs.twimg.com/example.jpg',
          embedUrl: 'https://platform.twitter.com/embed/Tweet.html?id=1',
        }}
      />,
    );

    const video = container.querySelector('video');
    expect(video).toHaveAttribute('src', 'https://video.twimg.com/example.mp4');
    expect(video).toHaveAttribute('poster', 'https://pbs.twimg.com/example.jpg');
    expect(video).toHaveAttribute('controls');
    expect(video).toHaveAttribute('playsinline');
    expect(video).toHaveAttribute('preload', 'metadata');
    expect(container.querySelector('iframe')).not.toBeInTheDocument();
  });

  it('marks still media so the complete image can remain visible', () => {
    const { container } = render(
      <MediaViewer item={{ ...baseItem, mediaType: 'image', mediaUrl: 'https://example.com/image.jpg' }} />,
    );

    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(container.querySelector('.media-frame')).toHaveClass('media-still');
  });

  it('keeps the bounded X embed as a fallback when direct media is unavailable', () => {
    const { container } = render(
      <MediaViewer item={{ ...baseItem, embedUrl: 'https://platform.twitter.com/embed/Tweet.html?id=1' }} />,
    );

    expect(screen.getByTitle('Today Drained Me post')).toBeInTheDocument();
    expect(container.querySelector('.media-frame')).toHaveClass('media-embed');
  });
});
