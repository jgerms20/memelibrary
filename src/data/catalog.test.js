import { describe, expect, it } from 'vitest';
import * as catalogBuilder from '../../scripts/build-catalog.mjs';
import generatedCatalog from './catalog.generated.json';
import { memes } from './memes.js';

describe('expanded catalog', () => {
  it('keeps a large, source-linked mix of generated media', () => {
    const ids = generatedCatalog.map((item) => item.id);
    const mediaUrls = generatedCatalog.map((item) => item.mediaUrl);
    const mediaTypes = new Set(generatedCatalog.map((item) => item.mediaType));

    expect(generatedCatalog.length).toBeGreaterThanOrEqual(1_000);
    expect(generatedCatalog.length).toBeLessThanOrEqual(5_000);
    expect(new Set(ids).size).toBe(generatedCatalog.length);
    expect(new Set(mediaUrls).size).toBe(generatedCatalog.length);
    expect(generatedCatalog.every((item) => /^https?:\/\//.test(item.mediaUrl))).toBe(true);
    expect(generatedCatalog.every((item) => /^https?:\/\//.test(item.sourceUrl))).toBe(true);
    expect(generatedCatalog.every((item) => (
      typeof item.indexedAt === 'string' && !Number.isNaN(Date.parse(item.indexedAt))
    ))).toBe(true);
    expect(mediaTypes).toEqual(new Set(['image', 'gif', 'video']));
  });

  it('retains the original indexed date when stored media is normalized', () => {
    const normalizedLegacyRecord = generatedCatalog.find((item) => item.id === 'reddit-1ulg870');

    expect(normalizedLegacyRecord.mediaUrl).toBe('https://i.imgur.com/HLjXZlX.mp4');
    expect(normalizedLegacyRecord.indexedAt).toBe('July 19, 2026');
  });

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
    expect(memes.filter((item) => item.platform === 'X').length).toBeGreaterThanOrEqual(10);
    expect(memes.some((item) => item.title === 'Today Drained Me')).toBe(true);
    expect(memes.some((item) => item.title === 'Mariah Carey: Oh Really? That Sucks')).toBe(true);
  });
});

describe('catalog builder', () => {
  it('formats dynamic indexed dates as UTC calendar dates', () => {
    expect(catalogBuilder.utcDateStamp).toBeTypeOf('function');
    expect(catalogBuilder.utcDateStamp(new Date('2027-01-02T23:59:59-08:00'))).toBe('2027-01-03');
  });

  it('retains existing records before incoming duplicates', () => {
    const existing = [{ id: 'same-id', mediaUrl: 'https://cdn.example/old.gif', indexedAt: '2026-01-01' }];
    const incoming = [{ id: 'same-id', mediaUrl: 'https://cdn.example/new.gif', indexedAt: '2027-01-01' }];

    expect(catalogBuilder.mergeCatalog(existing, incoming, 5)).toEqual(existing);
  });

  it('deduplicates incoming records by media URL', () => {
    const existing = [{ id: 'existing', mediaUrl: 'https://cdn.example/shared.gif' }];
    const incoming = [
      { id: 'duplicate-media', mediaUrl: 'https://cdn.example/shared.gif' },
      { id: 'unique', mediaUrl: 'https://cdn.example/unique.gif' },
    ];

    expect(catalogBuilder.mergeCatalog(existing, incoming, 5).map((item) => item.id)).toEqual(['existing', 'unique']);
  });

  it('caps merged catalogs at 5,000 records', () => {
    const incoming = Array.from({ length: 5_001 }, (_, index) => ({
      id: `record-${index}`,
      mediaUrl: `https://cdn.example/${index}.gif`,
    }));

    expect(catalogBuilder.mergeCatalog([], incoming, 5_000)).toHaveLength(5_000);
  });
});
