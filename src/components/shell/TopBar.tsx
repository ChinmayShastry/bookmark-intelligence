import { useEffect, useRef, useState } from 'react';
import { Search, Command, Upload } from 'lucide-react';
import type { Route } from '../../lib/router/useHashRouter';

interface TopBarProps {
  route: Route;
  onSearch: (query: string) => void;
  onOpenPalette: () => void;
  onImport: () => void;
}

export function TopBar({ route, onSearch, onOpenPalette, onImport }: TopBarProps) {
  const [value, setValue] = useState(route.view === 'search' ? (route.params.get('q') ?? '') : '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (route.view === 'search') {
      setValue(route.params.get('q') ?? '');
    } else {
      setValue('');
    }
  }, [route.view, route.params]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target && ['INPUT', 'TEXTAREA'].includes(target.tagName);
      if (event.key === '/' && !isTyping) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <header className="flex items-center gap-3 border-b border-ink-100 bg-white/80 px-4 py-3 backdrop-blur-md md:px-6 dark:border-ink-800 dark:bg-ink-950/80">
      <div className="relative flex-1 max-w-xl">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          role="searchbox"
          aria-label="Search your bookmarks"
          placeholder="Search your bookmarks..."
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            onSearch(event.target.value);
          }}
          className="w-full rounded-lg border border-ink-200 bg-white py-2 pl-9 pr-16 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-ink-700 dark:bg-ink-900 dark:text-white dark:placeholder:text-ink-500 dark:focus:ring-brand-500/30"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[10px] font-medium text-ink-400 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-500">
          /
        </kbd>
      </div>

      <button
        type="button"
        onClick={onImport}
        className="hidden items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-50 sm:flex dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-800"
      >
        <Upload size={15} aria-hidden="true" />
        Import
      </button>

      <button
        type="button"
        onClick={onOpenPalette}
        aria-label="Open command palette"
        className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 py-2 text-sm font-medium text-ink-500 transition hover:bg-ink-50 dark:border-ink-700 dark:text-ink-400 dark:hover:bg-ink-800"
      >
        <Command size={15} aria-hidden="true" />
        <span className="hidden text-xs sm:inline">K</span>
      </button>
    </header>
  );
}
