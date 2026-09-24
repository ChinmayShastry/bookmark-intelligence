import { useRef, useState } from 'react';
import { Download, FileJson, FileSpreadsheet, FileCode, Upload, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAppState, useAppStore } from '../../lib/store/hooks';
import { bookmarksToCsv, bookmarksToJson, bookmarksToNetscapeHtml } from '../../lib/export/formats';
import { downloadFile } from '../../lib/export/downloadFile';
import { createBackupFile, parseBackupFile, CorruptBackupError } from '../../lib/backup';

type RestoreState =
  | { kind: 'idle' }
  | { kind: 'preview'; counts: { bookmarks: number; categories: number; tags: number }; raw: string }
  | { kind: 'error'; message: string }
  | { kind: 'done' };

export function ExportView() {
  const bookmarks = useAppState((s) => s.bookmarks);
  const categories = useAppState((s) => s.categories);
  const tags = useAppState((s) => s.tags);
  const collections = useAppState((s) => s.collections);
  const settings = useAppState((s) => s.settings);
  const backups = useAppState((s) => s.backups);
  const store = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreState, setRestoreState] = useState<RestoreState>({ kind: 'idle' });
  const [lastBackup, setLastBackup] = useState<{ createdAt: number; bookmarks: number; categories: number; tags: number } | null>(null);

  const createBackup = async () => {
    const content = createBackupFile({ bookmarks, categories, tags, collections, settings });
    downloadFile('bookmark-intelligence-backup.json', content, 'application/json');
    await store.recordBackup('manual');
    setLastBackup({ createdAt: Date.now(), bookmarks: bookmarks.length, categories: categories.length, tags: tags.length });
  };

  const handleRestoreFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = parseBackupFile(text);
      setRestoreState({
        kind: 'preview',
        counts: { bookmarks: parsed.bookmarks.length, categories: parsed.categories.length, tags: parsed.tags.length },
        raw: text,
      });
    } catch (error) {
      setRestoreState({
        kind: 'error',
        message: error instanceof CorruptBackupError ? error.message : 'Please choose a Bookmark Intelligence backup JSON file.',
      });
    }
  };

  const confirmRestore = async () => {
    if (restoreState.kind !== 'preview') return;
    const parsed = parseBackupFile(restoreState.raw);
    await store.restoreFromBackup(parsed);
    setRestoreState({ kind: 'done' });
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-4 md:p-6">
      <h1 className="text-lg font-semibold text-ink-900 dark:text-white">Export &amp; Backup</h1>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
        You can always leave with your data. Nothing here requires an account or network access.
      </p>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-ink-900 dark:text-white">Export your bookmarks</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <ExportCard
            icon={FileJson}
            title="JSON"
            description="Complete data, ideal for re-importing here."
            onClick={() => downloadFile('bookmarks.json', bookmarksToJson(bookmarks, categories, tags), 'application/json')}
          />
          <ExportCard
            icon={FileSpreadsheet}
            title="CSV"
            description="Open in a spreadsheet."
            onClick={() => downloadFile('bookmarks.csv', bookmarksToCsv(bookmarks, categories, tags), 'text/csv')}
          />
          <ExportCard
            icon={FileCode}
            title="HTML"
            description="Standard bookmark format any browser can import."
            onClick={() => downloadFile('bookmarks.html', bookmarksToNetscapeHtml(bookmarks), 'text/html')}
          />
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-ink-100 p-4 dark:border-ink-800">
        <h2 className="text-sm font-semibold text-ink-900 dark:text-white">Backup</h2>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          A full backup includes bookmarks, categories, tags, collections, and settings — everything needed to
          restore your workspace exactly.
        </p>
        <button
          type="button"
          onClick={createBackup}
          className="mt-3 flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Download size={15} aria-hidden="true" />
          Create backup
        </button>
        {lastBackup && (
          <div className="mt-3 rounded-lg bg-ink-50 p-3 text-xs text-ink-600 dark:bg-ink-900 dark:text-ink-300">
            <p className="font-medium text-ink-800 dark:text-ink-100">
              Backup created: {new Date(lastBackup.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <p>
              {lastBackup.bookmarks.toLocaleString()} bookmarks · {lastBackup.categories} categories ·{' '}
              {lastBackup.tags} tags
            </p>
          </div>
        )}
        {backups.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs text-ink-400">
            {backups.slice(0, 5).map((b) => (
              <li key={b.id}>
                {new Date(b.createdAt).toLocaleString()} — {b.bookmarkCount.toLocaleString()} bookmarks
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl border border-ink-100 p-4 dark:border-ink-800">
        <h2 className="text-sm font-semibold text-ink-900 dark:text-white">Restore</h2>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          Restoring replaces everything currently in this browser with the contents of the backup file.
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-3 flex items-center gap-2 rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-800"
        >
          <Upload size={15} aria-hidden="true" />
          Choose backup file
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleRestoreFile(file);
            e.target.value = '';
          }}
        />

        {restoreState.kind === 'error' && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle size={14} aria-hidden="true" />
            {restoreState.message}
          </p>
        )}

        {restoreState.kind === 'preview' && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-500/30 dark:bg-amber-500/10">
            <p className="font-medium text-amber-800 dark:text-amber-300">This backup contains:</p>
            <p className="text-amber-700 dark:text-amber-400">
              {restoreState.counts.bookmarks.toLocaleString()} bookmarks · {restoreState.counts.categories} categories
              · {restoreState.counts.tags} tags
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={confirmRestore}
                className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
              >
                Replace my current data
              </button>
              <button
                type="button"
                onClick={() => setRestoreState({ kind: 'idle' })}
                className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {restoreState.kind === 'done' && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
            <ShieldCheck size={14} aria-hidden="true" />
            Restore complete.
          </p>
        )}
      </section>
    </div>
  );
}

function ExportCard({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: typeof FileJson;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start gap-2 rounded-xl border border-ink-100 p-4 text-left transition hover:border-brand-200 hover:shadow-sm dark:border-ink-800"
    >
      <Icon size={18} className="text-brand-600 dark:text-brand-400" aria-hidden="true" />
      <span className="text-sm font-semibold text-ink-900 dark:text-white">{title}</span>
      <span className="text-xs text-ink-500 dark:text-ink-400">{description}</span>
    </button>
  );
}
