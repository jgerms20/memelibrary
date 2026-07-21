import { describe, expect, it } from 'vitest';
import { extractMedia } from '../../scripts/refresh-x-media.mjs';
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
        directVideoUrl: media.videoUrl,
        posterUrl: media.posterUrl,
        verifiedAt: media.verifiedAt,
      });
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
});
