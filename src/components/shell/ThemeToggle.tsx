import { Sun, Moon, Monitor } from 'lucide-react';
import { useAppState, useAppStore } from '../../lib/store/hooks';
import type { ThemePreference } from '../../lib/db/types';

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export function ThemeToggle() {
  const theme = useAppState((s) => s.settings.theme);
  const store = useAppStore();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="flex items-center gap-0.5 rounded-lg border border-ink-200 bg-white p-0.5 dark:border-ink-700 dark:bg-ink-900"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          title={label}
          onClick={() => store.updateSettings({ theme: value })}
          className={`flex flex-1 items-center justify-center rounded-md py-1.5 transition ${
            theme === value
              ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-900'
              : 'text-ink-500 hover:text-ink-900 dark:text-ink-400 dark:hover:text-white'
          }`}
        >
          <Icon size={14} aria-hidden="true" />
          <span className="sr-only">{label}</span>
        </button>
      ))}
    </div>
  );
}
