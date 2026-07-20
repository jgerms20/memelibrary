import { describe, expect, it } from 'vitest';
import { memes } from './memes.js';

describe('expanded catalog', () => {
  it('contains at least 500 unique safe source-linked records', () => {
    expect(memes.length).toBeGreaterThanOrEqual(500);
    expect(new Set(memes.map((item) => item.id)).size).toBe(memes.length);
    expect(memes.every((item) => item.nsfw !== true && item.spoiler !== true)).toBe(true);
    expect(memes.every((item) => item.mediaUrl?.startsWith('http'))).toBe(true);
    expect(memes.every((item) => item.sourceUrl?.startsWith('http'))).toBe(true);
  });

  it('normalizes discovery fields used by search and provenance', () => {
    expect(memes.every((item) => item.platform && item.creator && item.indexedAt)).toBe(true);
    expect(memes.every((item) => Array.isArray(item.tags) && Array.isArray(item.contexts))).toBe(true);
    expect(memes.some((item) => item.community === 'Black Twitter')).toBe(true);
    expect(memes.some((item) => item.platform === 'Imgflip')).toBe(true);
    expect(memes.some((item) => item.platform === 'Reddit')).toBe(true);
  });
});
