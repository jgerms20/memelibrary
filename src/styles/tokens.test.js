import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function luminance(hex) {
  const channels = hex.match(/[a-f\d]{2}/gi).map((value) => Number.parseInt(value, 16) / 255);
  const [red, green, blue] = channels.map((value) => (
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  ));
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

function contrast(left, right) {
  const brightest = Math.max(luminance(left), luminance(right));
  const darkest = Math.min(luminance(left), luminance(right));
  return (brightest + 0.05) / (darkest + 0.05);
}

function token(block, name) {
  return block.match(new RegExp(`--${name}:\\s*(#[a-f\\d]{3,6})`, 'i'))?.[1];
}

describe('theme color tokens', () => {
  it('keeps primary action text at WCAG AA contrast in both themes', async () => {
    const css = await readFile(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8');
    const blocks = [...css.matchAll(/:root(?:\[data-theme='dark'\])?\s*{([^}]+)}/g)].map((match) => match[1]);

    expect(blocks).toHaveLength(2);
    for (const block of blocks) {
      expect(contrast(token(block, 'signal'), token(block, 'signal-ink'))).toBeGreaterThanOrEqual(4.5);
      expect(contrast(token(block, 'accent'), token(block, 'accent-ink'))).toBeGreaterThanOrEqual(4.5);
    }
  });
});
