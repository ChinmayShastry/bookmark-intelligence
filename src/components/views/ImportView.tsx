import { useCallback, useRef, useState } from 'react';
import { Upload, FileWarning, CheckCircle2, Lock, ChevronDown } from 'lucide-react';
import { useAppState, useAppStore } from '../../lib/store/hooks';
import {
  buildImportPreview,
  commitImportPreview,
  UnsupportedFileError,
  type ImportPreview,
} from '../../lib/import/importBookmarks';
import { InvalidBookmarkFileError } from '../../lib/parser/bookmarkHtml';
import { EXPORT_STEPS } from '../../lib/content/exportSteps';

type Stage =
  | { kind: 'idle' }
  | { kind: 'parsing'; phase: string; done: number; total: number }
  | { kind: 'preview'; preview: ImportPreview }
  | { kind: 'committing'; done: number; total: number }
  | { kind: 'done'; count: number }
  | { kind: 'error'; message: string };

interface ImportViewProps {
  onFinished: (opts: { review: boolean }) => void;
}

function isValidExtension(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith('.html') || name.endsWith('.htm');
}

export function ImportView({ onFinished }: ImportViewProps) {
  const [stage, setStage] = useState<Stage>({ kind: 'idle' });
  const [dragOver, setDragOver] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const store = useAppStore();
  const categories = useAppState((s) => s.categories);
  const bookmarks = useAppState((s) => s.bookmarks);
  const settings = useAppState((s) => s.settings);

  const handleFile = useCallback(
    async (file: File) => {
      if (!isValidExtension(file)) {
        setStage({ kind: 'error', message: 'Please choose a browser bookmark HTML file.' });
        return;
      }
      setStage({ kind: 'parsing', phase: 'parsing', done: 0, total: 1 });
      try {
        const preview = await buildImportPreview(file, {
          categories,
          autoCategorize: settings.autoCategorize,
          autoTag: settings.autoTag,
          existingBookmarks: bookmarks,
          onProgress: (phase, done, total) => setStage({ kind: 'parsing', phase, done, total }),
        });
        setStage({ kind: 'preview', preview });
      } catch (error) {
        if (error instanceof UnsupportedFileError || error instanceof InvalidBookmarkFileError) {
          setStage({ kind: 'error', message: error.message });
        } else {
          setStage({ kind: 'error', message: "This backup or bookmark file appears incomplete or corrupted." });
        }
      }
    },
    [categories, bookmarks, settings]
  );

  const commit = useCallback(
    async (preview: ImportPreview, review: boolean) => {
      setStage({ kind: 'committing', done: 0, total: preview.bookmarks.length });
      await commitImportPreview(preview, store, (done, total) => setStage({ kind: 'committing', done, total }));
      setStage({ kind: 'done', count: preview.bookmarks.length });
      onFinished({ review });
    },
    [store, onFinished]
  );

  const reset = () => setStage({ kind: 'idle' });

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-xl font-semibold text-ink-900 dark:text-white">Import bookmarks</h1>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
        Export your bookmarks as an HTML file from your browser, then drop it here.
      </p>

      {stage.kind === 'idle' && (
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) void handleFile(file);
            }}
            className={`mt-6 flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-8 py-14 text-center transition ${
              dragOver
                ? 'border-brand-400 bg-brand-50 dark:bg-brand-500/10'
                : 'border-ink-200 bg-ink-50/50 dark:border-ink-700 dark:bg-ink-900/40'
            }`}
          >
            <Upload size={28} className="text-brand-600 dark:text-brand-400" aria-hidden="true" />
            <p className="text-sm font-medium text-ink-700 dark:text-ink-200">
              Drag your bookmarks HTML file here, or
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Choose file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".html,.htm,text/html"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
                e.target.value = '';
              }}
            />
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-400 dark:text-ink-500">
            <Lock size={12} aria-hidden="true" />
            Your bookmark file is processed entirely on this device — it is never uploaded.
          </p>

          <button
            type="button"
            onClick={() => setHelpOpen((v) => !v)}
            className="mt-8 flex w-full items-center justify-between rounded-lg border border-ink-200 px-4 py-3 text-sm font-medium text-ink-700 dark:border-ink-700 dark:text-ink-200"
          >
            How do I export bookmarks from my browser?
            <ChevronDown size={16} className={`transition ${helpOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
          {helpOpen && (
            <dl className="mt-2 grid gap-4 rounded-lg border border-ink-100 p-4 sm:grid-cols-2 dark:border-ink-800">
              {EXPORT_STEPS.map(({ browser, steps }) => (
                <div key={browser}>
                  <dt className="text-sm font-semibold text-ink-900 dark:text-white">{browser}</dt>
                  <dd>
                    <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-xs text-ink-500 dark:text-ink-400">
                      {steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </>
      )}

      {stage.kind === 'parsing' && (
        <div className="mt-8 space-y-3">
          <p className="text-sm text-ink-600 dark:text-ink-300">
            {stage.phase === 'parsing' ? 'Reading your bookmarks…' : 'Classifying and preparing your bookmarks…'}
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
            <div
              className="h-full rounded-full bg-brand-600 transition-all"
              style={{ width: `${stage.total ? Math.round((stage.done / stage.total) * 100) : 0}%` }}
            />
          </div>
        </div>
      )}

      {stage.kind === 'preview' && (
        <div className="mt-8">
          <p className="text-sm text-ink-500 dark:text-ink-400">Found</p>
          <p className="text-3xl font-semibold text-ink-900 dark:text-white">
            {stage.preview.stats.total.toLocaleString()} bookmarks
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatBlock label="Duplicates" value={stage.preview.stats.duplicateCount} />
            <StatBlock label="Empty folders" value={stage.preview.stats.emptyFolderCount} />
            <StatBlock label="Untitled" value={stage.preview.stats.untitledCount} />
            <StatBlock label="Folders" value={stage.preview.stats.folderCount} />
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => commit(stage.preview, false)}
              className="flex-1 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Import Everything
            </button>
            <button
              type="button"
              onClick={() => commit(stage.preview, true)}
              className="flex-1 rounded-lg border border-ink-200 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-800"
            >
              Review First
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-ink-500 transition hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {stage.kind === 'committing' && (
        <div className="mt-8 space-y-3">
          <p className="text-sm text-ink-600 dark:text-ink-300">
            Importing… {stage.done.toLocaleString()} / {stage.total.toLocaleString()} (
            {stage.total ? Math.round((stage.done / stage.total) * 100) : 0}%)
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
            <div
              className="h-full rounded-full bg-brand-600 transition-all"
              style={{ width: `${stage.total ? Math.round((stage.done / stage.total) * 100) : 0}%` }}
            />
          </div>
        </div>
      )}

      {stage.kind === 'done' && (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-ink-100 bg-ink-50/60 py-10 text-center dark:border-ink-800 dark:bg-ink-900/40">
          <CheckCircle2 size={28} className="text-emerald-500" aria-hidden="true" />
          <p className="text-sm font-medium text-ink-800 dark:text-ink-100">
            {stage.count.toLocaleString()} bookmarks organized.
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-ink-200 px-4 py-1.5 text-xs font-medium text-ink-600 dark:border-ink-700 dark:text-ink-300"
          >
            Import another file
          </button>
        </div>
      )}

      {stage.kind === 'error' && (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 py-10 text-center dark:border-red-900/40 dark:bg-red-950/20">
          <FileWarning size={28} className="text-red-500" aria-hidden="true" />
          <p className="text-sm font-medium text-red-700 dark:text-red-300">{stage.message}</p>
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-ink-100 p-3 text-center dark:border-ink-800">
      <p className="text-lg font-semibold text-ink-900 dark:text-white">{value.toLocaleString()}</p>
      <p className="text-xs text-ink-500 dark:text-ink-400">{label}</p>
    </div>
  );
}
