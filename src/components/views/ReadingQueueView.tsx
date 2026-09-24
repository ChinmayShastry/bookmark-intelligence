import { useMemo, useState } from 'react';
import { BookOpenCheck, ExternalLink, Check, Archive, Trash2, SkipForward } from 'lucide-react';
import { useAppState, useAppStore } from '../../lib/store/hooks';
import { SafeExternalLink } from '../common/SafeExternalLink';
import { Favicon } from '../common/Favicon';

export function ReadingQueueView() {
  const bookmarks = useAppState((s) => s.bookmarks);
  const categories = useAppState((s) => s.categories);
  const store = useAppStore();
  const [skipped, setSkipped] = useState<string[]>([]);

  const queue = useMemo(() => {
    const active = bookmarks
      .filter((b) => b.readLater && !b.readLaterDone && !b.archived)
      .sort((a, b) => (a.dateAdded ?? a.importedAt) - (b.dateAdded ?? b.importedAt));
    const skippedSet = new Set(skipped);
    return [...active.filter((b) => !skippedSet.has(b.id)), ...active.filter((b) => skippedSet.has(b.id))];
  }, [bookmarks, skipped]);

  const current = queue[0];
  const upNext = queue.slice(1);

  const categoryName = (id?: string) => categories.find((c) => c.id === id)?.name;

  if (!current) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-10 text-center">
        <BookOpenCheck size={26} className="text-ink-300 dark:text-ink-700" aria-hidden="true" />
        <p className="text-sm font-medium text-ink-600 dark:text-ink-300">Your reading queue is empty</p>
        <p className="text-xs text-ink-400">Add bookmarks to "Read Later" from their detail panel.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-4 md:p-6">
      <h1 className="text-lg font-semibold text-ink-900 dark:text-white">Reading Queue</h1>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{queue.length} bookmark(s) waiting, oldest first.</p>

      <div className="mt-4 rounded-2xl border border-brand-200 bg-brand-50/60 p-5 dark:border-brand-500/30 dark:bg-brand-500/10">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">Up next</p>
        <div className="mt-2 flex items-center gap-3">
          <Favicon icon={current.icon} size={22} />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-ink-900 dark:text-white">
              {current.title || current.url}
            </p>
            <p className="truncate text-xs text-ink-500 dark:text-ink-400">
              {current.domain}
              {categoryName(current.categories[0]) ? ` · ${categoryName(current.categories[0])}` : ''}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <SafeExternalLink
            url={current.url}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <ExternalLink size={14} aria-hidden="true" />
            Open
          </SafeExternalLink>
          <button
            type="button"
            onClick={() => store.updateBookmark(current.id, { readLaterDone: true })}
            className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200"
          >
            <Check size={14} aria-hidden="true" />
            Done
          </button>
          <button
            type="button"
            onClick={() => setSkipped((prev) => [...prev, current.id])}
            className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200"
          >
            <SkipForward size={14} aria-hidden="true" />
            Next
          </button>
          <button
            type="button"
            onClick={() => store.updateBookmark(current.id, { archived: true })}
            className="flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200"
          >
            <Archive size={14} aria-hidden="true" />
            Archive
          </button>
          <button
            type="button"
            onClick={() => store.deleteBookmarks([current.id])}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 dark:border-red-900/40 dark:bg-ink-900 dark:text-red-400"
          >
            <Trash2 size={14} aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>

      {upNext.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Then</p>
          <ul className="divide-y divide-ink-100 rounded-xl border border-ink-100 dark:divide-ink-800 dark:border-ink-800">
            {upNext.map((bookmark) => (
              <li key={bookmark.id} className="flex items-center gap-3 px-3.5 py-2.5">
                <Favicon icon={bookmark.icon} size={15} />
                <span className="min-w-0 flex-1 truncate text-sm text-ink-700 dark:text-ink-200">
                  {bookmark.title || bookmark.url}
                </span>
                <span className="shrink-0 text-xs text-ink-400">{bookmark.domain}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
