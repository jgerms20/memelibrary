const DAY = 86_400_000;

function validDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date;
}

export function trendSignalsFor(item, now = new Date()) {
  const indexedAt = validDate(item.indexedAt);
  const ageDays = indexedAt ? Math.max(0, (now.valueOf() - indexedAt.valueOf()) / DAY) : 365;
  const recency = Math.max(0, 1 - ageDays / 30);
  const engagement = Math.min(1, Math.log10(Math.max(0, Number(item.trendScore ?? 0)) + 1) / 4);
  const editorial = Math.min(1, Math.max(0, Number(item.trendBoost ?? 0)));
  const score = Math.round(recency * 45 + engagement * 35 + editorial * 20);
  const reasons = [];

  if (recency >= 0.5) reasons.push(`Indexed ${ageDays < 1 ? 'today' : `${Math.max(1, Math.round(ageDays))} days ago`}`);
  if (engagement >= 0.45) reasons.push('Strong source engagement');
  if (editorial > 0) reasons.push('Editorially verified as current');
  return {
    score,
    recency: Math.round(recency * 45),
    engagement: Math.round(engagement * 35),
    editorial: Math.round(editorial * 20),
    reasons,
    updatedAt: now.toISOString(),
  };
}

export function rankTrending(items, now = new Date()) {
  return items
    .map((item) => {
      const signals = trendSignalsFor(item, now);
      return { item, trendScore: signals.score, trendReasons: signals.reasons, trendSignals: signals };
    })
    .filter(({ trendSignals }) => (
      trendSignals.recency > 0
      || trendSignals.engagement >= 5
      || trendSignals.editorial > 0
    ))
    .sort((left, right) => right.trendScore - left.trendScore || left.item.title.localeCompare(right.item.title));
}

export function catalogRequestUrl(query) {
  const normalized = String(query ?? '').trim();
  const url = new URL('https://github.com/jgerms20/memelibrary/issues/new');
  url.searchParams.set('title', `Catalog request: ${normalized || 'missing meme'}`);
  url.searchParams.set('labels', 'catalog-request');
  url.searchParams.set('body', [
    `Search that missed: ${normalized || '(not provided)'}`,
    '',
    'What happens in it:',
    'Where you remember seeing it:',
    'Any quote, person, outfit, object, or mood:',
  ].join('\n'));
  return url.toString();
}
