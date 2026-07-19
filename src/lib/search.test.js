import { describe, expect, it } from 'vitest';
import { searchMemes } from './search.js';

const items = [
  {
    id: 'damn-daniel',
    title: 'Damn Daniel',
    mediaType: 'video',
    aliases: ['white vans kid', 'back at it again'],
    quotes: ['damn Daniel', 'back at it again with the white Vans'],
    visual: ['teen boy at school wearing white slip-on shoes'],
    emotions: ['hype', 'compliment'],
    contexts: ['fresh outfit', 'someone looks good'],
    tags: ['Vine', 'shoes', 'hallway'],
  },
  {
    id: 'side-eye-chloe',
    title: 'Side Eyeing Chloe',
    mediaType: 'image',
    aliases: ['side eye girl', 'Chloe reaction'],
    quotes: [],
    visual: ['little girl in a car looking sideways with blonde hair'],
    emotions: ['skeptical', 'confused', 'unimpressed'],
    contexts: ['awkward surprise', 'disbelief'],
    tags: ['reaction image', 'child'],
  },
  {
    id: 'confused-travolta',
    title: 'Confused Travolta',
    mediaType: 'video',
    aliases: ['lost John Travolta'],
    quotes: [],
    visual: ['man in black suit looking around a room'],
    emotions: ['confused', 'lost'],
    contexts: ['when nobody is there', 'looking for something'],
    tags: ['movie', 'Pulp Fiction', 'gif'],
  },
];

describe('searchMemes', () => {
  it('ranks an exact quote above other results', () => {
    const [result] = searchMemes('back at it again with the white vans', items);
    expect(result.item.id).toBe('damn-daniel');
    expect(result.confidence).toBeGreaterThan(90);
  });

  it('matches a remembered alias and clothing detail', () => {
    const [result] = searchMemes('the white vans kid', items);
    expect(result.item.id).toBe('damn-daniel');
    expect(result.matchedTerms).toContain('white');
  });

  it('matches a visual description without the title', () => {
    const [result] = searchMemes('blonde girl looking sideways in the car', items);
    expect(result.item.id).toBe('side-eye-chloe');
  });

  it('expands everyday synonyms for intent recall', () => {
    const [result] = searchMemes('skeptical kid reaction', items);
    expect(result.item.id).toBe('side-eye-chloe');
  });

  it('filters results by media type', () => {
    const results = searchMemes('confused', items, 'image');
    expect(results.map((result) => result.item.id)).toEqual(['side-eye-chloe']);
  });

  it('returns the catalog in stable order for an empty query', () => {
    const results = searchMemes('', items);
    expect(results.map((result) => result.item.id)).toEqual([
      'damn-daniel',
      'side-eye-chloe',
      'confused-travolta',
    ]);
  });

  it('uses a low confidence floor when no terms overlap', () => {
    const [result] = searchMemes('spaceship banana orchestra', items);
    expect(result.confidence).toBeLessThanOrEqual(35);
  });
});
