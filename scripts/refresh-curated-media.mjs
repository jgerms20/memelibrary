import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const MANIFEST = resolve('scripts/curated-media.json');
const OUTPUT_DIRECTORY = resolve('public/media/curated');

export function isValidMp4(bytes) {
  return bytes.length > 1_000 && String.fromCharCode(...bytes.slice(4, 8)) === 'ftyp';
}

export function isValidAsset(bytes, type) {
  if (type === 'video/mp4') return isValidMp4(bytes);
  return bytes.length > 1_000;
}

async function existingIsHealthy(path, type) {
  try {
    return isValidAsset(new Uint8Array(await readFile(path)), type);
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

async function refreshAsset(asset) {
  const destination = resolve(OUTPUT_DIRECTORY, asset.filename);
  const temporary = `${destination}.${process.pid}.tmp`;
  try {
    const response = await fetch(asset.url, {
      headers: { 'user-agent': 'Meme Library curated media mirror' },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (!isValidAsset(bytes, asset.type)) throw new Error(`invalid ${asset.type} response`);
    await writeFile(temporary, bytes);
    await rename(temporary, destination);
    return 'updated';
  } catch (error) {
    await unlink(temporary).catch(() => {});
    if (await existingIsHealthy(destination, asset.type)) {
      console.warn(`Could not refresh ${asset.id}: ${error.message}; preserving packaged media.`);
      return 'preserved';
    }
    throw error;
  }
}

export async function refreshCuratedMedia() {
  const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
  await mkdir(OUTPUT_DIRECTORY, { recursive: true });
  const results = await Promise.all(manifest.map(refreshAsset));
  console.log(`Curated media ready: ${results.filter((result) => result === 'updated').length} updated, ${results.filter((result) => result === 'preserved').length} preserved.`);
}

if (import.meta.url === new URL(`file://${process.argv[1]}`).href) await refreshCuratedMedia();
