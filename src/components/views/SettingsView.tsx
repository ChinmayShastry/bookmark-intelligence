import { useEffect, useState } from 'react';
import { AlertTriangle, Trash2, Sun, Moon, Monitor } from 'lucide-react';
import { useAppState, useAppStore } from '../../lib/store/hooks';
import { Switch } from '../common/Switch';
import type { DensityPreference, ThemePreference } from '../../lib/db/types';

interface SettingsViewProps {
  onNavigate: (view: string) => void;
}

const SHORTCUTS: Array<[string, string]> = [
  ['/', 'Focus search'],
  ['N', 'Import bookmarks'],
  ['Esc', 'Close panel or dialog'],
  ['?', 'Show shortcut list'],
  ['Ctrl / Cmd + K', 'Open command palette'],
];

function SettingRow({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{title}</p>
        {description && <p className="text-xs text-ink-500 dark:text-ink-400">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-xl border border-ink-100 p-4 dark:border-ink-800">
      <h2 className="text-sm font-semibold text-ink-900 dark:text-white">{title}</h2>
      <div className="mt-1 divide-y divide-ink-100 dark:divide-ink-800">{children}</div>
    </section>
  );
}

export function SettingsView({ onNavigate }: SettingsViewProps) {
  const settings = useAppState((s) => s.settings);
  const bookmarkCount = useAppState((s) => s.bookmarks.length);
  const categoryCount = useAppState((s) => s.categories.length);
  const tagCount = useAppState((s) => s.tags.length);
  const store = useAppStore();

  const [confirmingClear, setConfirmingClear] = useState(false);
  const [storageEstimate, setStorageEstimate] = useState<string | null>(null);

  useEffect(() => {
    navigator.storage
      ?.estimate?.()
      .then((estimate) => {
        if (estimate.usage !== undefined) {
          setStorageEstimate(`${(estimate.usage / (1024 * 1024)).toFixed(1)} MB used on this device`);
        }
      })
      .catch(() => {});
  }, []);

  const clearAllData = async () => {
    await store.clearAllData();
    setConfirmingClear(false);
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-4 md:p-6">
      <h1 className="text-lg font-semibold text-ink-900 dark:text-white">Settings</h1>

      <SettingsSection title="Appearance">
        <SettingRow title="Theme">
          <div className="flex items-center gap-1 rounded-lg border border-ink-200 p-0.5 dark:border-ink-700">
            {(
              [
                ['light', Sun],
                ['dark', Moon],
                ['system', Monitor],
              ] as [ThemePreference, typeof Sun][]
            ).map(([value, Icon]) => (
              <button
                key={value}
                type="button"
                onClick={() => store.updateSettings({ theme: value })}
                className={`rounded-md p-1.5 ${
                  settings.theme === value ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-900' : 'text-ink-400'
                }`}
                aria-label={value}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
        </SettingRow>
        <SettingRow title="Density" description="Compact rows fit more bookmarks on screen.">
          <div className="flex items-center gap-1 rounded-lg border border-ink-200 p-0.5 text-xs dark:border-ink-700">
            {(['comfortable', 'compact'] as DensityPreference[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => store.updateSettings({ density: value })}
                className={`rounded-md px-2.5 py-1 capitalize ${
                  settings.density === value
                    ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-900'
                    : 'text-ink-500 dark:text-ink-400'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </SettingRow>
      </SettingsSection>

      <SettingsSection title="Search">
        <SettingRow title="Fuzzy search sensitivity" description="Higher allows looser matches.">
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.fuzzySensitivity}
            onChange={(e) => store.updateSettings({ fuzzySensitivity: Number(e.target.value) })}
            className="w-32 accent-brand-600"
            aria-label="Fuzzy search sensitivity"
          />
        </SettingRow>
      </SettingsSection>

      <SettingsSection title="Organization">
        <SettingRow title="Automatic category suggestions" description="Classify bookmarks into categories on import.">
          <Switch
            checked={settings.autoCategorize}
            onChange={(v) => store.updateSettings({ autoCategorize: v })}
            label="Automatic category suggestions"
          />
        </SettingRow>
        <SettingRow
          title="Automatic tag suggestions"
          description="Apply suggested tags automatically on import (otherwise you confirm them per-bookmark)."
        >
          <Switch
            checked={settings.autoTag}
            onChange={(v) => store.updateSettings({ autoTag: v })}
            label="Automatic tag suggestions"
          />
        </SettingRow>
      </SettingsSection>

      <SettingsSection title="Privacy">
        <SettingRow title="Local data" description={storageEstimate ?? 'Storage usage unavailable in this browser.'}>
          <span className="text-sm text-ink-500 dark:text-ink-400">
            {bookmarkCount.toLocaleString()} bookmarks · {categoryCount} categories · {tagCount} tags
          </span>
        </SettingRow>
        <SettingRow title="Export everything" description="Download a full backup or a specific format.">
          <button
            type="button"
            onClick={() => onNavigate('export')}
            className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 dark:border-ink-700 dark:text-ink-200"
          >
            Go to Export
          </button>
        </SettingRow>
        <SettingRow title="View the Privacy Center" description="What's stored, and what never leaves your device.">
          <button
            type="button"
            onClick={() => onNavigate('privacy-center')}
            className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 dark:border-ink-700 dark:text-ink-200"
          >
            Open
          </button>
        </SettingRow>
      </SettingsSection>

      <SettingsSection title="Keyboard shortcuts">
        {SHORTCUTS.map(([key, label]) => (
          <SettingRow key={key} title={label}>
            <kbd className="rounded border border-ink-200 bg-ink-50 px-2 py-0.5 font-mono text-xs text-ink-600 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300">
              {key}
            </kbd>
          </SettingRow>
        ))}
      </SettingsSection>

      <section className="mt-6 rounded-xl border border-red-200 p-4 dark:border-red-900/40">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-red-700 dark:text-red-400">
          <AlertTriangle size={15} aria-hidden="true" />
          Delete all local data
        </h2>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          This will permanently remove your bookmarks, tags, categories, notes, and settings from this browser.
        </p>
        {!confirmingClear ? (
          <button
            type="button"
            onClick={() => setConfirmingClear(true)}
            className="mt-3 flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/20"
          >
            <Trash2 size={14} aria-hidden="true" />
            Delete all local data
          </button>
        ) : (
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={clearAllData}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Yes, permanently delete everything
            </button>
            <button
              type="button"
              onClick={() => setConfirmingClear(false)}
              className="rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-600 dark:border-ink-700 dark:text-ink-300"
            >
              Cancel
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
