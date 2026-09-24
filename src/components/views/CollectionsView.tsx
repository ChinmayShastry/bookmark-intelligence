import { useMemo, useState } from 'react';
import { Star, BookOpenCheck, Copy, Tag as TagIcon, History, Archive, Clock, FolderTree, Plus, Trash2 } from 'lucide-react';
import { useAppState, useAppStore } from '../../lib/store/hooks';
import { searchBookmarks } from '../../lib/search';
import { BookmarksView } from './BookmarksView';

interface CollectionsViewProps {
  selectedId: string | null;
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

const SMART_COLLECTIONS = [
  { id: 'recent', name: 'Recently Added', query: 'recent', icon: Clock },
  { id: 'favorites', name: 'Favorites', query: 'favorite:true', icon: Star },
  { id: 'read-later', name: 'Read Later', query: 'readLater:true', icon: BookOpenCheck },
  { id: 'duplicates', name: 'Duplicates', query: 'duplicate:true', icon: Copy },
  { id: 'untagged', name: 'Untagged', query: 'untagged', icon: TagIcon },
  { id: 'forgotten', name: 'Forgotten', query: 'old', icon: History },
  { id: 'archived', name: 'Archived', query: 'archived:true', icon: Archive },
];

export function CollectionsView({ selectedId, onNavigate }: CollectionsViewProps) {
  const bookmarks = useAppState((s) => s.bookmarks);
  const categories = useAppState((s) => s.categories);
  const tags = useAppState((s) => s.tags);
  const settings = useAppState((s) => s.settings);
  const customCollections = useAppState((s) => s.collections);
  const store = useAppStore();
  const [newName, setNewName] = useState('');

  const ctx = { bookmarks, categories, tags, fuzzySensitivity: settings.fuzzySensitivity, forgottenThresholdDays: settings.forgottenThresholdDays };

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of SMART_COLLECTIONS) map.set(c.id, searchBookmarks(c.query, ctx).length);
    for (const category of categories) map.set(`category:${category.id}`, searchBookmarks(`category:${category.id}`, ctx).length);
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookmarks, categories, tags, settings.fuzzySensitivity, settings.forgottenThresholdDays]);

  const selectedSmart = SMART_COLLECTIONS.find((c) => c.id === selectedId);
  const selectedCustom = customCollections.find((c) => c.id === selectedId);

  if (selectedSmart) {
    return (
      <BookmarksView
        key={selectedSmart.id}
        initialQuery={selectedSmart.query}
        title={selectedSmart.name}
      />
    );
  }

  if (selectedCustom) {
    return (
      <BookmarksView
        key={selectedCustom.id}
        initialQuery=""
        title={selectedCustom.name}
        idFilter={new Set(selectedCustom.bookmarkIds)}
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-4 md:p-6">
      <h1 className="text-lg font-semibold text-ink-900 dark:text-white">Collections</h1>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
        Smart collections update automatically as your library changes.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {SMART_COLLECTIONS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onNavigate('collections', { id: c.id })}
            className="rounded-xl border border-ink-100 bg-white p-4 text-left transition hover:border-brand-200 hover:shadow-sm dark:border-ink-800 dark:bg-ink-900/60"
          >
            <c.icon size={18} className="text-brand-600 dark:text-brand-400" aria-hidden="true" />
            <p className="mt-2 text-xl font-semibold text-ink-900 dark:text-white">{(counts.get(c.id) ?? 0).toLocaleString()}</p>
            <p className="text-xs text-ink-500 dark:text-ink-400">{c.name}</p>
          </button>
        ))}
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onNavigate('search', { q: `category:${category.id}` })}
            className="rounded-xl border border-ink-100 bg-white p-4 text-left transition hover:border-brand-200 hover:shadow-sm dark:border-ink-800 dark:bg-ink-900/60"
          >
            <FolderTree size={18} className="text-ink-400" aria-hidden="true" />
            <p className="mt-2 text-xl font-semibold text-ink-900 dark:text-white">
              {(counts.get(`category:${category.id}`) ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-ink-500 dark:text-ink-400">{category.name}</p>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-ink-900 dark:text-white">Your collections</h2>
        <div className="mt-2 flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === 'Enter' && newName.trim()) {
                await store.addCollection(newName.trim());
                setNewName('');
              }
            }}
            placeholder="New collection name…"
            className="max-w-xs flex-1 rounded-lg border border-ink-200 px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-900"
          />
          <button
            type="button"
            onClick={async () => {
              if (newName.trim()) {
                await store.addCollection(newName.trim());
                setNewName('');
              }
            }}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Plus size={14} aria-hidden="true" />
            Create
          </button>
        </div>

        {customCollections.length === 0 ? (
          <p className="mt-4 text-sm text-ink-400">
            No custom collections yet. Create one, then add bookmarks to it from a bookmark's detail panel.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-ink-100 rounded-xl border border-ink-100 dark:divide-ink-800 dark:border-ink-800">
            {customCollections.map((collection) => (
              <li key={collection.id} className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={() => onNavigate('collections', { id: collection.id })}
                  className="flex-1 text-left text-sm font-medium text-ink-800 hover:text-brand-600 dark:text-ink-100"
                >
                  {collection.name}
                </button>
                <span className="text-xs text-ink-400">{collection.bookmarkIds.length} bookmarks</span>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete collection "${collection.name}"? Bookmarks themselves are kept.`)) {
                      void store.deleteCollection(collection.id);
                    }
                  }}
                  aria-label={`Delete collection ${collection.name}`}
                  className="rounded-md p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
