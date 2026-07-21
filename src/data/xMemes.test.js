import { describe, expect, it } from 'vitest';
import { xMemes } from './xMemes.js';

describe('curated X media', () => {
  it('exposes resolved direct MP4s and posters while retaining embed fallbacks', () => {
    const resolved = xMemes.filter((item) => item.directVideoUrl);

    expect(resolved.length).toBeGreaterThan(0);
    expect(resolved.every((item) => /^https:\/\/video\.twimg\.com\/.+\.mp4(?:\?|$)/.test(item.directVideoUrl))).toBe(true);
    expect(resolved.some((item) => /^https:\/\//.test(item.posterUrl))).toBe(true);
    expect(xMemes.every((item) => /^https:\/\/platform\.twitter\.com\/embed\/Tweet\.html\?/.test(item.embedUrl))).toBe(true);
  });
});
