import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { X_POSTS } from '../src/data/xPosts.js';

const outputUrl = new URL('../src/data/xMedia.generated.json', import.meta.url);
const mediaDirectoryUrl = new URL('../public/media/x/', import.meta.url);

function decodeEscapes(value) {
  let decoded = value;

  for (let pass = 0; pass < 3; pass += 1) {
    decoded = decoded
      .replace(/\\u([0-9a-f]{4})/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
      .replace(/\\x([0-9a-f]{2})/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
      .replace(/\\\//g, '/')
      .replace(/&amp;/g, '&')
      .replace(/&#x2F;/gi, '/')
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'");
  }

  return decoded;
}

function pixelArea(url) {
  const dimensions = new URL(url).pathname.match(/(?:^|\/)(\d+)x(\d+)(?:\/|$)/);
  return dimensions ? Number(dimensions[1]) * Number(dimensions[2]) : 0;
}

function isUrlFrom(url, hostname) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname === hostname;
  } catch {
    return false;
  }
}

function mediaIdFromUrl(url, kind) {
  const family = kind === 'video'
    ? '(?:ext_tw_video|amplify_video|tweet_video)'
    : '(?:ext_tw_video_thumb|amplify_video_thumb|tweet_video_thumb)';
  return new URL(url).pathname.match(new RegExp(`(?:^|/)${family}/(\\d+)(?:/|$)`))?.[1];
}

function focalPosterUrl(page, posters) {
  const metaTags = page.match(/<meta\b[^>]*>/gi) ?? [];
  const imageTag = metaTags.find((tag) => /\b(?:property|name)=["'](?:og:image(?::secure_url)?|twitter:image)["']/i.test(tag));
  const content = imageTag?.match(/\bcontent=["']([^"']+)["']/i)?.[1];
  return posters.find(({ url }) => url === content)?.url;
}

export function extractMedia(page) {
  const decodedPage = decodeEscapes(page);
  const videos = [...new Set(decodedPage.match(/https:\/\/video\.twimg\.com\/[^"'<>\s]+?\.mp4(?:\?[^"'<>\s]*)?/g) ?? [])]
    .filter((url) => isUrlFrom(url, 'video.twimg.com'))
    .map((url) => ({ id: mediaIdFromUrl(url, 'video'), url }))
    .filter(({ id }) => id);
  const posters = [...new Set(decodedPage.match(/https:\/\/pbs\.twimg\.com\/[^"'<>\s]+/g) ?? [])]
    .map((url) => url.replace(/[),.;]+$/, ''))
    .filter((url) => isUrlFrom(url, 'pbs.twimg.com'))
    .map((url) => ({ id: mediaIdFromUrl(url, 'poster'), url }))
    .filter(({ id }) => id);
  const focalPoster = focalPosterUrl(decodedPage, posters);
  const focalMediaId = focalPoster && mediaIdFromUrl(focalPoster, 'poster');

  if (!focalMediaId) return {};

  const matchingVideos = videos
    .filter(({ id }) => id === focalMediaId)
    .sort((left, right) => pixelArea(right.url) - pixelArea(left.url) || left.url.localeCompare(right.url));

  if (!matchingVideos.length) return {};

  return {
    videoUrl: matchingVideos[0].url,
    posterUrl: focalPoster,
  };
}

async function readPrevious() {
  try {
    return JSON.parse(await readFile(outputUrl, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
}

async function refreshPost(post, previousEntry) {
  try {
    const response = await fetch(post.sourceUrl, {
      headers: {
        accept: 'text/html,application/xhtml+xml',
        'accept-language': 'en-US,en;q=0.9',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const extracted = extractMedia(await response.text());
    if (!extracted.videoUrl || !extracted.posterUrl) throw new Error('no correlated MP4 and poster found');

    return {
      videoUrl: extracted.videoUrl,
      posterUrl: extracted.posterUrl,
      verifiedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn(`Could not refresh ${post.id}: ${error.message}`);
    return previousEntry;
  }
}

async function isHealthyLocalFile(fileUrl) {
  try {
    return (await stat(fileUrl)).size > 1_000;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

async function downloadMedia(sourceUrl, targetUrl, canReuseExisting) {
  if (canReuseExisting && await isHealthyLocalFile(targetUrl)) return;

  try {
    const response = await fetch(sourceUrl, {
      headers: { 'user-agent': 'Mozilla/5.0 Meme Library media mirror' },
      redirect: 'follow',
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength <= 1_000) throw new Error('response was unexpectedly small');
    const temporaryUrl = new URL(`${fileURLToPath(targetUrl)}.tmp`, 'file:');
    await writeFile(temporaryUrl, bytes);
    await rename(temporaryUrl, targetUrl);
  } catch (error) {
    if (await isHealthyLocalFile(targetUrl)) {
      console.warn(`Could not update ${fileURLToPath(targetUrl)}: ${error.message}; keeping the existing asset`);
      return;
    }
    throw error;
  }
}

async function syncLocalMedia(postId, entry, previousEntry) {
  if (!entry?.videoUrl || !entry?.posterUrl) return;
  await Promise.all([
    downloadMedia(
      entry.videoUrl,
      new URL(`${postId}.mp4`, mediaDirectoryUrl),
      previousEntry?.videoUrl === entry.videoUrl,
    ),
    downloadMedia(
      entry.posterUrl,
      new URL(`${postId}.jpg`, mediaDirectoryUrl),
      previousEntry?.posterUrl === entry.posterUrl,
    ),
  ]);
}

async function main() {
  const previous = await readPrevious();
  const refreshedEntries = await Promise.all(
    X_POSTS.map(async (post) => [post.id, await refreshPost(post, previous[post.id])]),
  );
  const refreshed = Object.fromEntries(refreshedEntries.filter(([, entry]) => entry));

  await mkdir(mediaDirectoryUrl, { recursive: true });
  await Promise.all(
    Object.entries(refreshed).map(([postId, entry]) => syncLocalMedia(postId, entry, previous[postId])),
  );

  await writeFile(outputUrl, `${JSON.stringify(refreshed, null, 2)}\n`);
  console.log(`Wrote ${Object.keys(refreshed).length}/${X_POSTS.length} X media records to ${fileURLToPath(outputUrl)}`);
}

if (fileURLToPath(import.meta.url) === process.argv[1]) await main();
