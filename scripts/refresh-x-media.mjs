import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { X_POSTS } from '../src/data/xPosts.js';

const outputUrl = new URL('../src/data/xMedia.generated.json', import.meta.url);

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

function extractMedia(page) {
  const decodedPage = decodeEscapes(page);
  const videoUrls = [...new Set(decodedPage.match(/https:\/\/video\.twimg\.com\/[^"'<>\s]+?\.mp4(?:\?[^"'<>\s]*)?/g) ?? [])]
    .filter((url) => isUrlFrom(url, 'video.twimg.com'))
    .sort((left, right) => pixelArea(right) - pixelArea(left) || left.localeCompare(right));
  const posterUrls = [...new Set(decodedPage.match(/https:\/\/pbs\.twimg\.com\/[^"'<>\s]+/g) ?? [])]
    .map((url) => url.replace(/[),.;]+$/, ''))
    .filter((url) => isUrlFrom(url, 'pbs.twimg.com') && /(?:video|tweet)_thumb|amplify_video_thumb/.test(url));

  return {
    videoUrl: videoUrls[0],
    posterUrl: posterUrls[0],
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
    if (!extracted.videoUrl) throw new Error('no MP4 found');

    return {
      videoUrl: extracted.videoUrl,
      ...(extracted.posterUrl || previousEntry?.posterUrl
        ? { posterUrl: extracted.posterUrl ?? previousEntry.posterUrl }
        : {}),
      verifiedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn(`Could not refresh ${post.id}: ${error.message}`);
    return previousEntry;
  }
}

const previous = await readPrevious();
const refreshedEntries = await Promise.all(
  X_POSTS.map(async (post) => [post.id, await refreshPost(post, previous[post.id])]),
);
const refreshed = Object.fromEntries(refreshedEntries.filter(([, entry]) => entry));

await writeFile(outputUrl, `${JSON.stringify(refreshed, null, 2)}\n`);
console.log(`Wrote ${Object.keys(refreshed).length}/${X_POSTS.length} X media records to ${fileURLToPath(outputUrl)}`);
