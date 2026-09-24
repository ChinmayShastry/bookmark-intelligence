import { useEffect } from 'react';
import { useAppState } from '../store/hooks';
import type { ThemePreference } from '../db/types';

function resolveTheme(pref: ThemePreference): 'light' | 'dark' {
  if (pref === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return pref;
}

/** Applies the user's theme preference to the document and mirrors it to
 * localStorage purely so the blocking head script can paint the right
 * theme before IndexedDB has loaded (see SeoHead.astro). IndexedDB
 * settings remain the source of truth. */
export function useThemeSync(): void {
  const theme = useAppState((s) => s.settings.theme);

  useEffect(() => {
    const apply = () => {
      document.documentElement.dataset.theme = resolveTheme(theme);
      try {
        localStorage.setItem('bi-theme', theme);
      } catch {
        // Storage may be unavailable (private browsing); the app still works.
      }
    };
    apply();

    if (theme === 'system') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      mql.addEventListener('change', apply);
      return () => mql.removeEventListener('change', apply);
    }
    return undefined;
  }, [theme]);
}
