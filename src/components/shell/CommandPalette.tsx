import { useEffect, useMemo, useRef, useState } from 'react';
import { Star, Moon, Download as DownloadIcon } from 'lucide-react';
import { ALL_NAV } from '../../lib/router/navConfig';
import { useAppState, useAppStore } from '../../lib/store/hooks';
import type { ThemePreference } from '../../lib/db/types';

interface Command {
  id: string;
  label: string;
  hint?: string;
  icon: (props: { size?: number }) => JSX.Element;
  run: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

const THEME_CYCLE: ThemePreference[] = ['light', 'dark', 'system'];

export function CommandPalette({ open, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const store = useAppStore();
  const theme = useAppState((s) => s.settings.theme);

  const commands = useMemo<Command[]>(() => {
    const navCommands: Command[] = ALL_NAV.map((item) => ({
      id: `nav-${item.view}`,
      label: `Go to ${item.label}`,
      icon: ({ size = 16 }) => <item.icon size={size} aria-hidden="true" />,
      run: () => onNavigate(item.view),
    }));

    return [
      ...navCommands,
      {
        id: 'favorites',
        label: 'Favorites',
        icon: ({ size = 16 }) => <Star size={size} aria-hidden="true" />,
        run: () => onNavigate('favorites'),
      },
      {
        id: 'toggle-theme',
        label: 'Toggle dark mode',
        icon: ({ size = 16 }) => <Moon size={size} aria-hidden="true" />,
        run: () => {
          const next = THEME_CYCLE[(THEME_CYCLE.indexOf(theme) + 1) % THEME_CYCLE.length];
          store.updateSettings({ theme: next });
        },
      },
      {
        id: 'export-data',
        label: 'Export data',
        icon: ({ size = 16 }) => <DownloadIcon size={size} aria-hidden="true" />,
        run: () => onNavigate('export'),
      },
    ];
  }, [onNavigate, store, theme]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setHighlighted(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setHighlighted(0);
  }, [query]);

  if (!open) return null;

  const execute = (command: Command | undefined) => {
    if (!command) return;
    command.run();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink-950/40 px-4 pt-[12vh] backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-xl border border-ink-200 bg-white shadow-2xl shadow-ink-950/20 animate-slide-up dark:border-ink-700 dark:bg-ink-900"
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setHighlighted((h) => Math.max(h - 1, 0));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              execute(filtered[highlighted]);
            } else if (e.key === 'Escape') {
              onClose();
            }
          }}
          placeholder="Search commands..."
          aria-label="Search commands"
          className="w-full border-b border-ink-100 bg-transparent px-4 py-3.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none dark:border-ink-800 dark:text-white dark:placeholder:text-ink-500"
        />
        <ul className="max-h-80 overflow-y-auto scrollbar-thin p-1.5" role="listbox">
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-ink-400">No matching commands</li>
          )}
          {filtered.map((command, index) => (
            <li key={command.id}>
              <button
                type="button"
                role="option"
                aria-selected={index === highlighted}
                onMouseEnter={() => setHighlighted(index)}
                onClick={() => execute(command)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition ${
                  index === highlighted
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                    : 'text-ink-700 dark:text-ink-200'
                }`}
              >
                <command.icon size={16} />
                {command.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
