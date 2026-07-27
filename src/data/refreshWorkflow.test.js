import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { isValidAsset, isValidMp4 } from '../../scripts/refresh-curated-media.mjs';

const WORKFLOW_PATH = resolve(process.cwd(), '.github/workflows/refresh-library.yml');

describe('library refresh workflow', () => {
  it('rejects corrupt packaged MP4 fallbacks', () => {
    const corrupt = new Uint8Array(2_000);
    const valid = new Uint8Array(2_000);
    valid.set([0x66, 0x74, 0x79, 0x70], 4);

    expect(isValidMp4(corrupt)).toBe(false);
    expect(isValidAsset(corrupt, 'video/mp4')).toBe(false);
    expect(isValidAsset(valid, 'video/mp4')).toBe(true);
  });

  it('refreshes, verifies, and commits the catalog without expiring deployment credentials', async () => {
    const workflow = await readFile(WORKFLOW_PATH, 'utf8');

    expect(workflow).toContain('schedule:');
    expect(workflow).toContain('workflow_dispatch:');
    expect(workflow).toContain('contents: write');
    expect(workflow).toContain('ref: main');
    const jobHeader = workflow.slice(workflow.indexOf('jobs:'), workflow.indexOf('steps:'));
    expect(jobHeader).not.toContain('VERCEL_TOKEN');
    expect(workflow).toContain('npm run catalog:refresh');
    expect(workflow).toContain('npm run x-media:refresh');
    expect(workflow).toContain('npm run curated-media:refresh');
    expect(workflow).toContain('public/media/x');

    const testPosition = workflow.indexOf('npm test -- --run');
    const buildPosition = workflow.indexOf('npm run build');
    const commitPosition = workflow.indexOf('git commit');
    expect(testPosition).toBeGreaterThan(0);
    expect(buildPosition).toBeGreaterThan(testPosition);
    expect(commitPosition).toBeGreaterThan(buildPosition);

    expect(workflow).not.toContain('vercel@');
    expect(workflow).not.toContain('VERCEL_TOKEN');
    expect(workflow).not.toContain('VERCEL_ORG_ID');
    expect(workflow).not.toContain('VERCEL_PROJECT_ID');
  });
});
