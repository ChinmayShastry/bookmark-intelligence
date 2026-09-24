import { useMemo, useState } from 'react';
import { Copy, EyeOff } from 'lucide-react';
import { useAppState, useAppStore } from '../../lib/store/hooks';
import { findDuplicateGroups } from '../../lib/duplicates';
import type { Bookmark } from '../../lib/db/types';

const IGNORED_KEY = 'ignoredDuplicateGroups';

function newest(items: Bookmark[]): Bookmark {
  return [...items].sort((a, b) => (b.dateAdded ?? b.importedAt) - (a.dateAdded ?? a.importedAt))[0];
}
function oldest(items: Bookmark[]): Bookmark {
  return [...items].sort((a, b) => (a.dateAdded ?? a.importedAt) - (b.dateAdded ?? b.importedAt))[0];
}

export function DuplicatesView() {
  const bookmarks = useAppState((s) => s.bookmarks);
  const metadata = useAppState((s) => s.metadata);
  const store = useAppStore();
  const [keepChoice, setKeepChoice] = useState<Record<string, string>>({});

  const ignored = useMemo(() => new Set((metadata[IGNORED_KEY] as string[] | undefined) ?? []), [metadata]);
  const groups = useMemo(
    () => findDuplicateGroups(bookmarks).filter((g) => !ignored.has(g.normalizedUrl)),
    [bookmarks, ignored]
  );

  const keepOnly = async (keepId: string, items: Bookmark[]) => {
    await store.deleteBookmarks(items.filter((b) => b.id !== keepId).map((b) => b.id));
  };

  const mergeGroup = async (items: Bookmark[]) => {
    const target = newest(items);
    const others = items.filter((b) => b.id !== target.id);
    const categories = Array.from(new Set(items.flatMap((b) => b.categories)));
    const tags = Array.from(new Set(items.flatMap((b) => b.tags)));
    const notes = Array.from(new Set(items.map((b) => b.notes).filter(Boolean))).join('\n');
    await store.updateBookmark(target.id, {
      categories,
      tags,
      notes: notes || target.notes,
      favorite: items.some((b) => b.favorite),
      readLater: items.some((b) => b.readLater),
    });
    await store.deleteBookmarks(others.map((b) => b.id));
  };

  const ignoreGroup = (normalizedUrl: string) => {
    const next = [...ignored, normalizedUrl];
    void store.setMetadata(IGNORED_KEY, next);
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-4 md:p-6">
      <h1 className="text-lg font-semibold text-ink-900 dark:text-white">Duplicates</h1>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
        {groups.length} possible duplicate group{groups.length === 1 ? '' : 's'}, found by comparing normalized URLs
        (trailing slash, hash fragments, and known tracking parameters ignored).
      </p>

      {groups.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-2 text-center">
          <Copy size={26} className="text-ink-300 dark:text-ink-700" aria-hidden="true" />
          <p className="text-sm text-ink-500 dark:text-ink-400">No duplicates found. Your library is clean.</p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {groups.map((group) => {
            const rep = newest(group.items);
            const chosenKeep = keepChoice[group.normalizedUrl] ?? rep.id;
            return (
              <div key={group.normalizedUrl} className="rounded-xl border border-ink-100 p-4 dark:border-ink-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink-900 dark:text-white">{rep.title || rep.url}</p>
                    <p className="text-xs text-ink-500 dark:text-ink-400">
                      {group.items.length} copies · {rep.domain}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => ignoreGroup(group.normalizedUrl)}
                    className="flex items-center gap-1 text-xs font-medium text-ink-400 hover:text-ink-700 dark:hover:text-ink-200"
                  >
                    <EyeOff size={12} aria-hidden="true" />
                    Ignore
                  </button>
                </div>

                <ul className="mt-3 space-y-1.5">
                  {group.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-2 text-xs">
                      <input
                        type="radio"
                        name={`keep-${group.normalizedUrl}`}
                        checked={chosenKeep === item.id}
                        onChange={() => setKeepChoice((prev) => ({ ...prev, [group.normalizedUrl]: item.id }))}
                        className="h-3.5 w-3.5"
                      />
                      <span className="flex-1 truncate text-ink-600 dark:text-ink-300">{item.url}</span>
                      <span className="shrink-0 text-ink-400">
                        {item.dateAdded ? new Date(item.dateAdded).toLocaleDateString() : '—'}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => keepOnly(newest(group.items).id, group.items)}
                    className="rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800"
                  >
                    Keep newest
                  </button>
                  <button
                    type="button"
                    onClick={() => keepOnly(oldest(group.items).id, group.items)}
                    className="rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800"
                  >
                    Keep oldest
                  </button>
                  <button
                    type="button"
                    onClick={() => keepOnly(chosenKeep, group.items)}
                    className="rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800"
                  >
                    Keep selected
                  </button>
                  <button
                    type="button"
                    onClick={() => mergeGroup(group.items)}
                    className="rounded-lg bg-brand-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                  >
                    Merge (combine tags &amp; notes)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
