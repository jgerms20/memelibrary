import { isOriginalIntentEligible, provenanceStatusFor } from './provenance.js';

const FIELD_WEIGHTS = {
  title: 11,
  aliases: 9,
  quotes: 12,
  visual: 7,
  emotions: 8,
  contexts: 7,
  tags: 5,
  microtags: 6,
  platform: 4,
  community: 5,
  capturedIn: 3,
  summary: 3,
};

const SYNONYM_GROUPS = [
  ['tired', 'drained', 'exhausted', 'spent', 'wiped', 'overwhelmed'],
  ['confused', 'lost', 'bewildered', 'puzzled', 'where', 'disoriented'],
  ['skeptical', 'unimpressed', 'doubtful', 'side-eye', 'sideeye', 'suspicious'],
  ['happy', 'excited', 'hype', 'celebrate', 'celebration', 'joy'],
  ['fail', 'failure', 'awkward', 'embarrassing', 'flop', 'mistake'],
  ['wow', 'awe', 'amazed', 'beautiful', 'incredible', 'wonder'],
  ['dog', 'doge', 'shiba', 'puppy'],
  ['cat', 'kitten', 'kitty'],
  ['kid', 'child', 'boy', 'girl', 'teen'],
  ['song', 'music', 'singing', 'sings'],
  ['dance', 'dancing', 'moves'],
  ['deception', 'bait', 'trick', 'rickroll', 'rickrolled'],
  ['someone', 'somebody', 'person'],
  ['toe', 'toes', 'corn', 'corns', 'foot', 'feet'],
  ['tweet', 'twitter', 'post', 'screenshot'],
  ['leave', 'leaving', 'exit', 'exiting', 'walkout'],
];

const SYNONYM_INDEX = new Map();
const ITEM_FIELD_CACHE = new WeakMap();
for (const group of SYNONYM_GROUPS) {
  for (const term of group) SYNONYM_INDEX.set(term, group);
}

export const COMMUNITY_FACETS = [
  'Black Twitter',
  'Stan Twitter',
  'TV & film',
  'Sports',
  'Animals',
  'Current',
  'Classic internet',
];

export function communityFacetFor(item) {
  const raw = normalizeText(item.community);
  const tags = normalizeText([...(item.tags ?? []), ...(item.microtags ?? [])].join(' '));
  if (raw.includes('black twitter')) return 'Black Twitter';
  if (raw.includes('stan twitter')) return 'Stan Twitter';
  if (raw.includes('tv film') || raw.includes('film') || raw.includes('television')) return 'TV & film';
  if (raw.includes('sport')) return 'Sports';
  if (/\b(cat|dog|animal|puppy|kitten|bird|horse|pet)\b/.test(`${raw} ${tags}`)) return 'Animals';
  if (/current|reaction|relatable|wholesome/.test(raw)) return 'Current';
  return 'Classic internet';
}

export function normalizeText(value = '') {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokenize(value) {
  return normalizeText(value).split(' ').filter((token) => token.length > 1);
}

function stem(token) {
  if (token.length > 5 && token.endsWith('ing')) return token.slice(0, -3);
  if (token.length > 4 && token.endsWith('ed')) return token.slice(0, -2);
  if (token.length > 4 && token.endsWith('es')) return token.slice(0, -2);
  if (token.length > 3 && token.endsWith('s')) return token.slice(0, -1);
  return token;
}

function ngrams(value, size = 3) {
  const padded = ` ${normalizeText(value)} `;
  const grams = new Set();
  for (let index = 0; index <= padded.length - size; index += 1) grams.add(padded.slice(index, index + size));
  return grams;
}

function diceSimilarityWithGrams(left, rightGrams) {
  if (!left || !rightGrams?.size) return 0;
  const leftGrams = ngrams(left);
  let intersection = 0;
  for (const gram of leftGrams) if (rightGrams.has(gram)) intersection += 1;
  return (2 * intersection) / (leftGrams.size + rightGrams.size);
}

function oneEditApart(left, right) {
  if (left === right) return true;
  if (Math.abs(left.length - right.length) > 1) return false;
  let leftIndex = 0;
  let rightIndex = 0;
  let edits = 0;
  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] === right[rightIndex]) {
      leftIndex += 1;
      rightIndex += 1;
      continue;
    }
    edits += 1;
    if (edits > 1) return false;
    if (left.length > right.length) leftIndex += 1;
    else if (right.length > left.length) rightIndex += 1;
    else {
      leftIndex += 1;
      rightIndex += 1;
    }
  }
  return edits + Number(leftIndex < left.length || rightIndex < right.length) <= 1;
}

function expandTokens(tokens) {
  const expanded = new Set(tokens);
  for (const token of tokens) {
    for (const synonym of SYNONYM_INDEX.get(token) ?? []) expanded.add(synonym);
  }
  return expanded;
}

function valuesFor(item, field) {
  const value = item[field];
  return Array.isArray(value) ? value : [value ?? ''];
}

function indexedFields(item) {
  const cached = ITEM_FIELD_CACHE.get(item);
  if (cached) return cached;
  const fields = [];
  for (const [field, weight] of Object.entries(FIELD_WEIGHTS)) {
    for (const rawValue of valuesFor(item, field)) {
      const text = normalizeText(rawValue);
      if (!text) continue;
      const tokenList = tokenize(text);
      fields.push({
        weight,
        text,
        tokenList,
        tokens: new Set(tokenList),
        stems: new Set(tokenList.map(stem)),
        grams: text.length >= 8 ? ngrams(text) : null,
      });
    }
  }
  ITEM_FIELD_CACHE.set(item, fields);
  return fields;
}

function scoreItem(item, query) {
  const queryText = normalizeText(query);
  const originalTokens = tokenize(queryText);
  const queryStems = new Set(originalTokens.map(stem));
  const expandedTokens = expandTokens(originalTokens);
  const matchedTerms = new Set();
  let score = 0;

  for (const { weight, text: fieldText, tokenList, tokens: fieldTokens, stems: fieldStems, grams } of indexedFields(item)) {

      if (queryText.length > 2 && fieldText.includes(queryText)) {
        score += weight * 8;
      } else if (fieldText.length > 2 && queryText.includes(fieldText)) {
        score += weight * 4;
      }

      for (const token of originalTokens) {
        if (fieldTokens.has(token)) {
          score += weight * 2.5;
          matchedTerms.add(token);
        }
      }

      for (const token of expandedTokens) {
        if (!originalTokens.includes(token) && fieldTokens.has(token)) {
          score += weight * 0.75;
        }
      }

      for (const token of originalTokens) {
        if (fieldTokens.has(token)) continue;
        if (fieldStems.has(stem(token)) && queryStems.has(stem(token))) {
          score += weight * 1.25;
          matchedTerms.add(token);
          continue;
        }
        if (token.length >= 4 && tokenList.some((fieldToken) => oneEditApart(token, fieldToken))) {
          score += weight;
          matchedTerms.add(token);
        }
      }

      if (queryText.length >= 8 && fieldText.length >= 8) {
        const similarity = diceSimilarityWithGrams(queryText, grams);
        if (similarity >= 0.34) score += weight * similarity * 5;
      }
  }

  if (originalTokens.length > 1 && matchedTerms.size === originalTokens.length) {
    score += 24;
  }

  if (item.featuredConfidence && score > 0) score += Math.max(0, item.featuredConfidence - 80) * 0.8;

  return { score, matchedTerms: [...matchedTerms] };
}

export function searchMemes(query, items, filter = 'all') {
  const facets = typeof filter === 'string'
    ? { media: filter, platform: 'all', community: 'all', provenance: 'all' }
    : { media: 'all', platform: 'all', community: 'all', provenance: 'all', ...filter };
  const eligible = items.filter((item) => {
    const mediaMatches = facets.media === 'all'
      || item.mediaType === facets.media
      || (facets.media === 'video' && item.mediaType === 'gif');
    const platformMatches = facets.platform === 'all' || item.platform === facets.platform;
    const communityMatches = facets.community === 'all' || communityFacetFor(item) === facets.community;
    const provenanceMatches = facets.provenance === 'all' || provenanceStatusFor(item) === facets.provenance;
    return isOriginalIntentEligible(item) && mediaMatches && platformMatches && communityMatches && provenanceMatches;
  });
  const queryText = normalizeText(query);
  const queryTokens = tokenize(queryText);

  if (!queryText) {
    return eligible.map((item, index) => ({
      item,
      score: 0,
      confidence: null,
      matchedTerms: [],
    }));
  }

  return eligible
    .map((item, index) => {
      const result = scoreItem(item, queryText);
      return {
        item,
        score: result.score,
        confidence: result.score === 0 ? 24 : Math.min(99, Math.round(38 + Math.sqrt(result.score) * 6)),
        matchedTerms: result.matchedTerms,
        originalIndex: index,
      };
    })
    .filter((result) => {
      if (result.score <= 0) return false;
      if (queryTokens.length < 3 || queryTokens.length >= 5) return true;
      return result.matchedTerms.length >= 2;
    })
    .sort((a, b) => b.score - a.score || a.originalIndex - b.originalIndex)
    .map(({ originalIndex: _originalIndex, ...result }) => result);
}
