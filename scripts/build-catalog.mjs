import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const OUTPUT = resolve('src/data/catalog.generated.json');
const MINIMUM = 1_000;
const MAXIMUM = 5_000;
export function utcDateStamp(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function withRefreshMetadata(record, date = new Date()) {
  const currentYear = String(date.getUTCFullYear());
  return {
    ...record,
    lastVerifiedAt: date.toISOString(),
    ...(record.timelineLabels
      ? { timelineLabels: { ...record.timelineLabels, now: currentYear } }
      : {}),
    ...(Array.isArray(record.trail)
      ? {
        trail: record.trail.map((step) => (
          step.label === 'Indexed' ? { ...step, date: currentYear } : step
        )),
      }
      : {}),
  };
}

export function validateCatalog(catalog, { minimum = MINIMUM, maximum = MAXIMUM, previousLength = 0 } = {}) {
  if (catalog.length < previousLength) throw new Error(`Catalog would shrink below ${previousLength} records.`);
  if (catalog.length < minimum) throw new Error(`Catalog has ${catalog.length}; expected at least ${minimum} records.`);
  if (catalog.length > maximum) throw new Error(`Catalog has ${catalog.length}; maximum is ${maximum} records.`);

  const ids = new Set();
  const mediaUrls = new Set();
  for (const record of catalog) {
    if (!record.id || ids.has(record.id)) throw new Error(`Duplicate id: ${record.id || '(missing)'}`);
    ids.add(record.id);
    if (!record.mediaUrl || !/^https?:\/\//.test(record.mediaUrl)) throw new Error(`Invalid media URL for ${record.id}`);
    if (mediaUrls.has(record.mediaUrl)) throw new Error(`Duplicate media URL for ${record.id}`);
    mediaUrls.add(record.mediaUrl);
    if (!record.sourceUrl || !/^https?:\/\//.test(record.sourceUrl)) throw new Error(`Invalid source URL for ${record.id}`);
    if (!record.indexedAt || Number.isNaN(Date.parse(record.indexedAt))) throw new Error(`Invalid indexedAt for ${record.id}`);
    if (!record.lastVerifiedAt || Number.isNaN(Date.parse(record.lastVerifiedAt))) throw new Error(`Invalid lastVerifiedAt for ${record.id}`);
    if (!['image', 'gif', 'video'].includes(record.mediaType)) throw new Error(`Invalid media type for ${record.id}`);
    if (record.nsfw === true || record.spoiler === true) throw new Error(`Unsafe record: ${record.id}`);
  }
  return catalog;
}

const INDEXED_AT = utcDateStamp();
const SUBREDDITS = [
  ['reactiongifs', 170, 'Reaction GIFs'],
  ['BlackPeopleTwitter', 120, 'Black Twitter'],
  ['HighQualityGifs', 70, 'TV / film'],
  ['memes', 45, 'Current memes'],
  ['wholesomememes', 25, 'Wholesome'],
  ['reactionpics', 60, 'Reaction images'],
  ['ReactionMemes', 45, 'Reaction memes'],
  ['MemeTemplatesOfficial', 55, 'Classic internet'],
  ['gifsthatkeepongiving', 70, 'Reaction GIFs'],
  ['wholesomegifs', 55, 'Wholesome'],
  ['PerfectTiming', 55, 'Current memes'],
  ['funny', 30, 'Current memes'],
  ['me_irl', 30, 'Relatable'],
  ['ComedyCemetery', 30, 'Internet archive'],
  ['WhitePeopleTwitter', 90, 'Internet culture'],
  ['HistoryMemes', 80, 'Culture and history'],
  ['starterpacks', 80, 'Internet culture'],
  ['dankmemes', 80, 'Current memes'],
  ['ProgrammerHumor', 80, 'Tech culture'],
  ['PrequelMemes', 80, 'TV / film'],
  ['marvelmemes', 70, 'TV / film'],
  ['lotrmemes', 70, 'TV / film'],
  ['AdviceAnimals', 80, 'Classic internet'],
  ['meirl', 60, 'Relatable'],
  ['technicallythetruth', 60, 'Internet culture'],
  ['trippinthroughtime', 60, 'Culture and history'],
  ['terriblefacebookmemes', 50, 'Internet archive'],
];

const STOP_WORDS = new Set([
  'about', 'after', 'again', 'being', 'from', 'have', 'into', 'just', 'like',
  'that', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'when',
  'where', 'with', 'would', 'your', 'youre', 'what', 'while', 'because',
]);

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
}

function tagsFrom(value, extras = []) {
  const tokens = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
  return [...new Set([...extras, ...tokens])].slice(0, 18);
}

function normalizeMediaUrl(url) {
  if (!url) return null;
  if (/^https:\/\/i\.imgur\.com\/[^?]+\.(?:gif|gifv)(?:\?|$)/i.test(url)) {
    return url.replace(/\.(?:gif|gifv)(?=\?|$)/i, '.mp4');
  }
  return url;
}

function mediaTypeFor(url) {
  const pathname = new URL(url).pathname.toLowerCase();
  if (pathname.endsWith('.mp4') || pathname.endsWith('.webm')) return 'video';
  if (pathname.endsWith('.gif')) return 'gif';
  return 'image';
}

function normalizeStoredRecord(record) {
  const mediaUrl = normalizeMediaUrl(record.mediaUrl);
  if (!mediaUrl || mediaUrl === record.mediaUrl) return record;
  return {
    ...record,
    mediaUrl,
    downloadUrl: mediaUrl,
    mediaType: mediaTypeFor(mediaUrl),
  };
}

function lifecycleFor(ups = 0) {
  const peak = Math.max(48, Math.min(100, Math.round(Math.log10(Number(ups) + 10) * 28)));
  return [8, 18, 42, peak, Math.max(36, peak - 18), Math.max(24, peak - 30), 20, 18, 16, 15, 14, 14];
}

function normalizeReddit(item, community) {
  const mediaUrl = normalizeMediaUrl(item.url);
  const redditId = item.postLink?.split('/').filter(Boolean).at(-1);
  const title = item.title?.trim() || 'Untitled reaction';
  const tags = tagsFrom(title, ['reaction', 'meme', community.toLowerCase()]);
  const creator = item.author || 'Reddit contributor';

  return {
    id: `reddit-${redditId || slug(title)}`,
    title,
    aliases: [title.replace(/^mrw\s+/i, 'my reaction when ')],
    quotes: [],
    visual: [title],
    emotions: tags.filter((tag) => ['angry', 'awkward', 'confused', 'crying', 'excited', 'happy', 'laughing', 'sad', 'shocked', 'tired'].includes(tag)),
    contexts: [title, `Shared in r/${item.subreddit}`],
    tags,
    microtags: tags,
    summary: title,
    why: `Matches the described reaction and tags attached to this r/${item.subreddit} post.`,
    origin: `Shared in r/${item.subreddit}.`,
    platform: 'Reddit',
    originPlatform: 'Reddit',
    community,
    mediaType: mediaTypeFor(mediaUrl),
    mediaUrl,
    sourceUrl: item.postLink,
    downloadUrl: mediaUrl,
    creator,
    creatorUrl: `https://www.reddit.com/user/${encodeURIComponent(creator)}`,
    firstUpload: 'Original Reddit post',
    firstUploadUrl: item.postLink,
    indexedAt: INDEXED_AT,
    capturedIn: `r/${item.subreddit}`,
    location: `r/${item.subreddit}`,
    peak: `${Number(item.ups || 0).toLocaleString()} upvotes when indexed`,
    trendScore: Number(item.ups || 0),
    featuredConfidence: 84,
    useCases: ['React to a conversation', 'Reply with a visual mood', `Browse ${community}`],
    lifecycle: lifecycleFor(item.ups),
    timelineLabels: { start: 'Posted', peak: 'Indexed', now: '2026' },
    trail: [
      { label: 'Source', date: 'Reddit', detail: `r/${item.subreddit}`, tone: 'yellow' },
      { label: 'Community', date: community, detail: `${Number(item.ups || 0).toLocaleString()} upvotes`, tone: 'purple' },
      { label: 'Indexed', date: '2026', detail: 'Added to Meme Library', tone: 'blue' },
      { label: 'Available', date: 'Now', detail: 'Linked to original post', tone: 'coral' },
    ],
    nsfw: false,
    spoiler: false,
  };
}

function normalizeImgflip(item) {
  const tags = tagsFrom(item.name, ['template', 'classic meme', 'image']);
  const sourceUrl = `https://imgflip.com/memetemplate/${item.id}`;
  return {
    id: `imgflip-${item.id}`,
    title: item.name,
    aliases: [item.name.toLowerCase()],
    quotes: [],
    visual: [`${item.name} meme template`],
    emotions: [],
    contexts: [`Create or recognize the ${item.name} format`],
    tags,
    microtags: tags,
    summary: `${item.name} is a widely reused image-meme template.`,
    why: `Matches the name and visual tags for the ${item.name} template.`,
    origin: 'Indexed from the public Imgflip template catalog.',
    platform: 'Imgflip',
    originPlatform: 'Imgflip',
    community: 'Classic internet',
    mediaType: 'image',
    mediaUrl: item.url,
    sourceUrl,
    downloadUrl: item.url,
    creator: 'Imgflip community',
    creatorUrl: 'https://imgflip.com/memetemplates',
    firstUpload: 'Public template catalog',
    firstUploadUrl: sourceUrl,
    indexedAt: INDEXED_AT,
    capturedIn: 'Imgflip template catalog',
    location: 'Imgflip template catalog',
    peak: 'Evergreen template',
    trendScore: Math.round((item.width || 1) * (item.height || 1) / 1000),
    featuredConfidence: 82,
    useCases: ['Create a caption meme', 'Identify a meme format', 'Find the clean template'],
    lifecycle: [8, 22, 44, 72, 88, 100, 86, 74, 66, 58, 52, 48],
    timelineLabels: { start: 'Template', peak: 'Popular', now: '2026' },
    trail: [
      { label: 'Template', date: 'Imgflip', detail: 'Public catalog', tone: 'yellow' },
      { label: 'Captions', date: 'Community', detail: 'Reusable format', tone: 'purple' },
      { label: 'Indexed', date: '2026', detail: 'Added to Meme Library', tone: 'blue' },
      { label: 'Available', date: 'Now', detail: 'Open the template', tone: 'coral' },
    ],
    nsfw: false,
    spoiler: false,
  };
}

async function getJson(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'MemeLibraryCatalog/2.0' },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

async function collectSubreddit(subreddit, target, community) {
  const records = new Map();
  for (let attempt = 0; attempt < 18 && records.size < target; attempt += 1) {
    let data;
    try {
      data = await getJson(`https://meme-api.com/gimme/${subreddit}/50`);
    } catch (error) {
      if (records.size === 0) throw error;
      console.warn(`Stopped r/${subreddit} after ${records.size} records: ${error.message}`);
      break;
    }
    for (const item of data.memes || []) {
      if (item.nsfw || item.spoiler || !item.url || !item.postLink) continue;
      const mediaUrl = normalizeMediaUrl(item.url);
      if (!mediaUrl || !/\.(?:gif|gifv|jpe?g|png|webp|mp4|webm)(?:\?|$)/i.test(item.url)) continue;
      const normalized = normalizeReddit({ ...item, url: mediaUrl }, community);
      records.set(normalized.id, normalized);
      if (records.size >= target) break;
    }
  }
  return [...records.values()];
}

async function loadExistingCatalog() {
  try {
    const catalog = JSON.parse(await readFile(OUTPUT, 'utf8'));
    if (!Array.isArray(catalog)) throw new TypeError(`${OUTPUT} must contain an array.`);
    return catalog;
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

export function mergeCatalog(existing, incoming, maximum = MAXIMUM) {
  if (!Number.isInteger(maximum) || maximum < 1) {
    throw new TypeError('maximum must be a positive integer.');
  }

  const ids = new Set();
  const mediaUrls = new Set();
  const merged = [];

  for (const record of [...existing, ...incoming]) {
    if (!record?.id || !record.mediaUrl || ids.has(record.id) || mediaUrls.has(record.mediaUrl)) continue;
    ids.add(record.id);
    mediaUrls.add(record.mediaUrl);
    merged.push(record);
    if (merged.length === maximum) break;
  }

  return merged;
}

export async function refreshCatalog() {
  const refreshStartedAt = new Date();
  const existingCatalog = (await loadExistingCatalog()).map(normalizeStoredRecord);
  const sources = [
    {
      name: 'Imgflip',
      collect: async () => {
        const data = await getJson('https://api.imgflip.com/get_memes');
        return (data.data?.memes || []).map(normalizeImgflip);
      },
    },
    ...SUBREDDITS.map(([subreddit, target, community]) => ({
      name: `r/${subreddit}`,
      collect: () => collectSubreddit(subreddit, target, community),
    })),
  ];

  const settledSources = await Promise.allSettled(sources.map((source) => source.collect()));
  const incoming = [];
  for (const [index, result] of settledSources.entries()) {
    if (result.status === 'fulfilled') {
      incoming.push(...result.value);
    } else {
      console.warn(`Skipped ${sources[index].name}: ${result.reason?.message || result.reason}`);
    }
  }

  const catalog = mergeCatalog(existingCatalog, incoming, MAXIMUM)
    .map((record) => withRefreshMetadata(record, refreshStartedAt));
  validateCatalog(catalog, { previousLength: existingCatalog.length });

  await writeFile(OUTPUT, `${JSON.stringify(catalog, null, 2)}\n`);
  console.log(`Wrote ${catalog.length} source-linked records (${catalog.length - existingCatalog.length} added) to ${OUTPUT}.`);
  return catalog;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await refreshCatalog();
}
