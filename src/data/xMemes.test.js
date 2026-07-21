import { describe, expect, it } from 'vitest';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { extractMedia, validateMediaResponse } from '../../scripts/refresh-x-media.mjs';
import xMedia from './xMedia.generated.json';
import { xMemes } from './xMemes.js';
import { X_POSTS } from './xPosts.js';

describe('curated X media', () => {
  it('merges every generated direct MP4 and poster while retaining embed fallbacks', () => {
    const generatedEntries = Object.entries(xMedia);

    expect(X_POSTS).toHaveLength(14);
    expect(generatedEntries).toHaveLength(X_POSTS.length);

    for (const [postId, media] of generatedEntries) {
      expect(media.videoUrl).toMatch(/^https:\/\/video\.twimg\.com\/.+\.mp4(?:\?|$)/);
      expect(media.posterUrl).toMatch(/^https:\/\/pbs\.twimg\.com\//);

      const meme = xMemes.find((item) => item.id === `x-${postId}`);
      expect(meme).toMatchObject({
        directVideoUrl: `/media/x/${postId}.mp4`,
        posterUrl: `/media/x/${postId}.jpg`,
        sourceVideoUrl: media.videoUrl,
        sourcePosterUrl: media.posterUrl,
        verifiedAt: media.verifiedAt,
      });
      const videoPath = resolve(process.cwd(), `public/media/x/${postId}.mp4`);
      const posterPath = resolve(process.cwd(), `public/media/x/${postId}.jpg`);
      expect(existsSync(videoPath)).toBe(true);
      expect(existsSync(posterPath)).toBe(true);
      expect(statSync(videoPath).size).toBeGreaterThan(1_000);
      expect(statSync(posterPath).size).toBeGreaterThan(1_000);
      expect(meme.embedUrl).toMatch(/^https:\/\/platform\.twitter\.com\/embed\/Tweet\.html\?/);
    }
  });

  it('selects the largest MP4 correlated with the focal post thumbnail', () => {
    const page = `
      <meta property="og:image" content="https://pbs.twimg.com/amplify_video_thumb/111/img/target.jpg" />
      {"url":"https:\\/\\/video.twimg.com\\/amplify_video\\/222\\/vid\\/avc1\\/1920x1080\\/quoted.mp4","media_url_https":"https:\\/\\/pbs.twimg.com\\/amplify_video_thumb\\/222\\/img\\/quoted.jpg"}
      {"url":"https:\\/\\/video.twimg.com\\/amplify_video\\/111\\/vid\\/avc1\\/640x360\\/target-low.mp4"}
      {"url":"https:\\/\\/video.twimg.com\\/amplify_video\\/111\\/vid\\/avc1\\/1280x720\\/target-high.mp4"}
    `;

    expect(extractMedia(page)).toEqual({
      videoUrl: 'https://video.twimg.com/amplify_video/111/vid/avc1/1280x720/target-high.mp4',
      posterUrl: 'https://pbs.twimg.com/amplify_video_thumb/111/img/target.jpg',
    });
  });

  it('rejects media without a correlated video and poster pair', () => {
    const page = `
      <meta property="og:image" content="https://pbs.twimg.com/amplify_video_thumb/111/img/target.jpg" />
      {"url":"https:\\/\\/video.twimg.com\\/amplify_video\\/222\\/vid\\/avc1\\/1920x1080\\/quoted.mp4"}
    `;

    expect(extractMedia(page)).toEqual({});
  });

  it('rejects HTML challenge bodies before they can replace media assets', () => {
    const html = new TextEncoder().encode('<!doctype html><title>challenge</title>');
    const mp4 = Uint8Array.from([0, 0, 0, 24, 102, 116, 121, 112, 105, 115, 111, 109]);
    const jpeg = Uint8Array.from([255, 216, 255, 224, 0, 16, 74, 70, 73, 70]);

    expect(validateMediaResponse('text/html', html, 'video')).toBe(false);
    expect(validateMediaResponse('video/mp4', mp4, 'video')).toBe(true);
    expect(validateMediaResponse('image/jpeg', jpeg, 'poster')).toBe(true);
    expect(validateMediaResponse('image/jpeg', html, 'poster')).toBe(false);
  });
});
