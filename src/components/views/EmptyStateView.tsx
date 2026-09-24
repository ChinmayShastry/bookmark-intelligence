import { Sparkles, Upload, PlayCircle } from 'lucide-react';
import { useAppStore } from '../../lib/store/hooks';
import { loadDemoData } from '../../lib/demo';

interface EmptyStateViewProps {
  onImport: () => void;
}

/** Shown when a returning user (onboarding already completed once) has an
 * empty library — e.g. after "Clear all data". Lighter-weight than the
 * full first-run onboarding wizard. */
export function EmptyStateView({ onImport }: EmptyStateViewProps) {
  const store = useAppStore();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <Sparkles size={32} className="text-brand-500" aria-hidden="true" />
      <h1 className="text-xl font-semibold text-ink-900 dark:text-white">Your bookmark intelligence starts here.</h1>
      <p className="max-w-sm text-sm text-ink-500 dark:text-ink-400">
        Import a browser bookmark export or try the demo to see everything Bookmark Intelligence can do.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onImport}
          className="flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Upload size={15} aria-hidden="true" />
          Import bookmarks
        </button>
        <button
          type="button"
          onClick={() => loadDemoData(store)}
          className="flex items-center justify-center gap-2 rounded-full border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-50 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-800"
        >
          <PlayCircle size={15} aria-hidden="true" />
          Try demo
        </button>
      </div>
    </div>
  );
}
