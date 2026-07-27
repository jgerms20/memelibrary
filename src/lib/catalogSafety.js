const EXPLICITLY_FICTIONAL_PATTERNS = [
  /\bfictional\b/i,
  /\b(?:eric andre|hannibal buress)\b/i,
  /\b(?:movie|tv|film|cartoon|anime|video game) (?:meme|scene|template)\b/i,
];

const TRAUMATIC_NEWS_PATTERNS = [
  /\bice\s+(?:is|agent|agents|raid|raids|shoot|shot|kill|killed)\b/i,
  /\bimmigration\s+raid\b/i,
  /\b(?:mass murder|mass shooting|death threat|shot dead|brain dead|death|deaths|died|dies|dead|funeral|suicide)\b/i,
  /\b(?:killed|murdered|assassinated|lynched|shooting|wounded|victims?|casualties)\b/i,
  /\bshot\b.{0,50}\b(?:him|her|them|people|person|man|woman|child|children|victim|victims)\b/i,
  /\b(?:war crimes?|genocide|terror(?:ism|ist)|bomb(?:ed|ing)|massacre)\b/i,
  /\b(?:soldiers?|children|people|man|woman) (?:was |were |are |is )?(?:killed|murdered|shot|dead|died)\b/i,
  /\bkilled over \d/i,
  /\b(?:dea|police|military|soldiers?|troops?)\b.{0,50}\b(?:raid|raids|shoot|shot|kill|killed|bomb|bombed|bombing)\b/i,
];

export function isSafeCatalogRecord(record = {}) {
  if (record.nsfw === true || record.spoiler === true) return false;
  const text = [
    record.title,
    record.summary,
    record.origin,
    ...(record.tags ?? []),
    ...(record.contexts ?? []),
  ].filter(Boolean).join(' ');
  if (EXPLICITLY_FICTIONAL_PATTERNS.some((pattern) => pattern.test(text))) return true;
  return !TRAUMATIC_NEWS_PATTERNS.some((pattern) => pattern.test(text));
}
