const FIELD_WEIGHTS = {
  title: 11,
  aliases: 9,
  quotes: 12,
  visual: 7,
  emotions: 8,
  contexts: 7,
  tags: 5,
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
];

const SYNONYM_INDEX = new Map();
for (const group of SYNONYM_GROUPS) {
  for (const term of group) SYNONYM_INDEX.set(term, group);
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

function scoreItem(item, query) {
  const queryText = normalizeText(query);
  const originalTokens = tokenize(queryText);
  const expandedTokens = expandTokens(originalTokens);
  const matchedTerms = new Set();
  let score = 0;

  for (const [field, weight] of Object.entries(FIELD_WEIGHTS)) {
    for (const rawValue of valuesFor(item, field)) {
      const fieldText = normalizeText(rawValue);
      if (!fieldText) continue;

      if (queryText.length > 2 && fieldText.includes(queryText)) {
        score += weight * 8;
      } else if (fieldText.length > 2 && queryText.includes(fieldText)) {
        score += weight * 4;
      }

      const fieldTokens = new Set(tokenize(fieldText));
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
    }
  }

  if (originalTokens.length > 1 && matchedTerms.size === originalTokens.length) {
    score += 24;
  }

  return { score, matchedTerms: [...matchedTerms] };
}

export function searchMemes(query, items, filter = 'all') {
  const eligible = items.filter((item) => filter === 'all' || item.mediaType === filter);
  const queryText = normalizeText(query);
  const queryTokens = tokenize(queryText);

  if (!queryText) {
    return eligible.map((item, index) => ({
      item,
      score: 0,
      confidence: Math.max(72, (item.featuredConfidence ?? 92) - index * 2),
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
