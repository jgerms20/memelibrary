import { describe, expect, it } from 'vitest';
import { catalogRequestUrl, rankTrending, trendSignalsFor } from './trending.js';

describe('trending helpers', () => {
  it('normalizes recency, engagement, and editorial currency into explained signals', () => {
    const item = {
      id: 'current-meme',
      indexedAt: '2026-07-26',
      trendScore: 10_000,
      trendBoost: 1,
      platform: 'Reddit',
    };
    const signals = trendSignalsFor(item, new Date('2026-07-27T12:00:00Z'));

    expect(signals.score).toBeGreaterThanOrEqual(90);
    expect(signals.reasons).toEqual(expect.arrayContaining([
      expect.stringMatching(/indexed/i),
      expect.stringMatching(/engagement/i),
      expect.stringMatching(/editorial/i),
    ]));
  });

  it('ranks current editorial records above stale low-engagement records', () => {
    const now = new Date('2026-07-27T12:00:00Z');
    const ranked = rankTrending([
      { id: 'stale', indexedAt: '2020-01-01', trendScore: 1, platform: 'Reddit' },
      { id: 'fresh', indexedAt: '2026-07-27', trendScore: 5_000, trendBoost: 1, platform: 'X' },
    ], now);

    expect(ranked[0].item.id).toBe('fresh');
    expect(ranked[0].trendReasons.length).toBeGreaterThan(0);
    expect(ranked.map(({ item }) => item.id)).not.toContain('stale');
  });

  it('excludes archive records with no meaningful current signal', () => {
    expect(rankTrending([
      { id: 'archive-only', indexedAt: '2012-01-01', trendScore: 0, trendBoost: 0, platform: 'YouTube' },
    ], new Date('2026-07-27T12:00:00Z'))).toEqual([]);
  });

  it('preserves the exact miss in a catalog request URL', () => {
    const url = new URL(catalogRequestUrl('spaceship banana orchestra'));
    expect(url.hostname).toBe('github.com');
    expect(url.searchParams.get('title')).toContain('spaceship banana orchestra');
    expect(url.searchParams.get('body')).toContain('spaceship banana orchestra');
  });
});
