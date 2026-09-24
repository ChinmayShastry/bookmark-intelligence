import { useEffect, useMemo, useState } from 'react';
import { Inbox } from 'lucide-react';
import { useAppState, useAppStore } from '../../lib/store/hooks';
import { searchBookmarks } from '../../lib/search';
import { useDebouncedValue } from '../../lib/utils/useDebouncedValue';
import { useVirtualList } from '../../lib/utils/useVirtualList';
import { BookmarkCard, BOOKMARK_ROW_HEIGHT } from '../bookmarks/BookmarkCard';
import { BookmarkDetailPanel } from '../bookmarks/BookmarkDetailPanel';
import { BookmarkFilterBar, DEFAULT_FILTERS, filtersToQuerySuffix, type BookmarkFilters } from '../bookmarks/BookmarkFilterBar';
import { BulkActionBar } from '../bookmarks/BulkActionBar';
import type { Bookmark } from '../../lib/db/types';

interface BookmarksViewProps {
  initialQuery: string;
  title: string;
  presetFilters?: Partial<BookmarkFilters>;
  idFilter?: Set<string>;
}

export function BookmarksView({ initialQuery, title, presetFilters, idFilter }: BookmarksViewProps) {
  const allBookmarks = useAppState((s) => s.bookmarks);
  const categories = useAppState((s) => s.categories);
  const tags = useAppState((s) => s.tags);
  const settings = useAppState((s) => s.settings);
  const store = useAppStore();

  const bookmarks = useMemo(
    () => (idFilter ? allBookmarks.filter((b) => idFilter.has(b.id)) : allBookmarks),
    [allBookmarks, idFilter]
  );

  const [filters, setFilters] = useState<BookmarkFilters>({ ...DEFAULT_FILTERS, ...presetFilters });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    setSelected(new Set());
  }, [initialQuery]);

  const debouncedQuery = useDebouncedValue(initialQuery, 150);
  const combinedQuery = useMemo(
    () => [debouncedQuery, filtersToQuerySuffix(filters)].filter(Boolean).join(' '),
    [debouncedQuery, filters]
  );

  const results = useMemo(
    () =>
      searchBookmarks(combinedQuery, {
        bookmarks,
        categories,
        tags,
        fuzzySensitivity: settings.fuzzySensitivity,
        forgottenThresholdDays: settings.forgottenThresholdDays,
      }),
    [combinedQuery, bookmarks, categories, tags, settings.fuzzySensitivity, settings.forgottenThresholdDays]
  );

  const { containerRef, range } = useVirtualList(results.length, BOOKMARK_ROW_HEIGHT);
  const visible = results.slice(range.startIndex, range.endIndex);
  const detailBookmark = bookmarks.find((b) => b.id === detailId) ?? null;

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pb-1 pt-4">
        <h1 className="text-lg font-semibold text-ink-900 dark:text-white">
          {title} <span className="ml-1 text-sm font-normal text-ink-400">({results.length.toLocaleString()})</span>
        </h1>
        {results.length > 0 && (
          <label className="flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400">
            <input
              type="checkbox"
              checked={selected.size > 0 && selected.size === results.length}
              onChange={(e) => setSelected(e.target.checked ? new Set(results.map((b) => b.id)) : new Set())}
              className="h-3.5 w-3.5 rounded border-ink-300"
            />
            Select all
          </label>
        )}
      </div>

      <BookmarkFilterBar bookmarks={bookmarks} filters={filters} onChange={setFilters} />

      {results.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <Inbox size={28} className="text-ink-300 dark:text-ink-700" aria-hidden="true" />
          <p className="text-sm font-medium text-ink-600 dark:text-ink-300">No bookmarks match</p>
          <p className="text-xs text-ink-400">Try a different search or clear your filters.</p>
        </div>
      ) : (
        <div ref={containerRef} className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
          <div style={{ height: range.totalHeight, position: 'relative' }}>
            <div style={{ transform: `translateY(${range.offsetY}px)` }} className="absolute inset-x-0 top-0">
              {visible.map((bookmark: Bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  categories={categories}
                  tags={tags}
                  selected={selected.has(bookmark.id)}
                  onToggleSelect={() => toggleSelect(bookmark.id)}
                  onOpenDetail={() => setDetailId(bookmark.id)}
                  onToggleFavorite={() => store.updateBookmark(bookmark.id, { favorite: !bookmark.favorite })}
                  onToggleArchive={() => store.updateBookmark(bookmark.id, { archived: !bookmark.archived })}
                  onToggleReadLater={() => store.updateBookmark(bookmark.id, { readLater: !bookmark.readLater })}
                  onDelete={() => store.deleteBookmarks([bookmark.id])}
                  onCopyUrl={() => navigator.clipboard?.writeText(bookmark.url).catch(() => {})}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <BulkActionBar selectedIds={[...selected]} bookmarks={bookmarks} onClear={() => setSelected(new Set())} />
      <BookmarkDetailPanel bookmark={detailBookmark} onClose={() => setDetailId(null)} />
    </div>
  );
}
