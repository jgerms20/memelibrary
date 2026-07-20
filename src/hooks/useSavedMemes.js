import { useCallback, useState } from 'react';

const STORAGE_KEY = 'meme-library:saved:v1';

function readSavedIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? [...new Set(parsed.filter(Boolean))] : [];
  } catch {
    return [];
  }
}

export function useSavedMemes() {
  const [savedIds, setSavedIds] = useState(readSavedIds);

  const isSaved = useCallback((id) => savedIds.includes(id), [savedIds]);

  const toggleSaved = useCallback((id) => {
    setSavedIds((current) => {
      const next = current.includes(id)
        ? current.filter((savedId) => savedId !== id)
        : [...current, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { savedIds, isSaved, toggleSaved };
}
