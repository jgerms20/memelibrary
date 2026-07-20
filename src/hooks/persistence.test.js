import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSavedMemes } from './useSavedMemes.js';
import { useTheme } from './useTheme.js';

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });
});

describe('useTheme', () => {
  it('uses the system theme first and persists a manual toggle', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');

    act(() => result.current.toggleTheme());

    expect(result.current.theme).toBe('light');
    expect(localStorage.getItem('meme-library:theme')).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});

describe('useSavedMemes', () => {
  it('persists saved IDs and supports removing them', () => {
    localStorage.setItem('meme-library:saved:v1', JSON.stringify(['keyboard-cat']));
    const { result } = renderHook(() => useSavedMemes());
    expect(result.current.isSaved('keyboard-cat')).toBe(true);

    act(() => result.current.toggleSaved('damn-daniel'));
    expect(result.current.isSaved('damn-daniel')).toBe(true);
    expect(JSON.parse(localStorage.getItem('meme-library:saved:v1'))).toEqual([
      'keyboard-cat',
      'damn-daniel',
    ]);

    act(() => result.current.toggleSaved('keyboard-cat'));
    expect(result.current.isSaved('keyboard-cat')).toBe(false);
  });
});
