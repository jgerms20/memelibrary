import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const WORKFLOW_PATH = resolve(process.cwd(), '.github/workflows/refresh-library.yml');

describe('library refresh workflow', () => {
  it('refreshes, verifies, commits, and deploys the catalog on a schedule or on demand', async () => {
    const workflow = await readFile(WORKFLOW_PATH, 'utf8');

    expect(workflow).toContain('schedule:');
    expect(workflow).toContain('workflow_dispatch:');
    expect(workflow).toContain('contents: write');
    expect(workflow).toContain('ref: main');
    expect(workflow).toContain('npm run catalog:refresh');
    expect(workflow).toContain('npm run x-media:refresh');

    const testPosition = workflow.indexOf('npm test -- --run');
    const buildPosition = workflow.indexOf('npm run build');
    const commitPosition = workflow.indexOf('git commit');
    expect(testPosition).toBeGreaterThan(0);
    expect(buildPosition).toBeGreaterThan(testPosition);
    expect(commitPosition).toBeGreaterThan(buildPosition);

    expect(workflow).toContain('vercel@56.4.1 deploy --prebuilt --prod');
    expect(workflow).toContain('VERCEL_TOKEN');
    expect(workflow).toContain('VERCEL_ORG_ID');
    expect(workflow).toContain('VERCEL_PROJECT_ID');
  });
});
