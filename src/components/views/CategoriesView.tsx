import { useMemo, useState } from 'react';
import { Plus, Pencil, Combine, Trash2, Lightbulb } from 'lucide-react';
import { useAppState, useAppStore } from '../../lib/store/hooks';
import { getCategoryCounts } from '../../lib/selectors/stats';
import { analyzeFolders } from '../../lib/classifier/folderIntelligence';
import { OverflowMenu } from '../common/OverflowMenu';

interface CategoriesViewProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

export function CategoriesView({ onNavigate }: CategoriesViewProps) {
  const bookmarks = useAppState((s) => s.bookmarks);
  const categories = useAppState((s) => s.categories);
  const store = useAppStore();

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [mergingId, setMergingId] = useState<string | null>(null);

  const counts = useMemo(() => getCategoryCounts(bookmarks, categories), [bookmarks, categories]);
  const countById = useMemo(() => new Map(counts.map((c) => [c.categoryId, c])), [counts]);
  const folderSuggestions = useMemo(() => analyzeFolders(bookmarks, categories), [bookmarks, categories]);

  const createCategory = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    try {
      await store.addCategory(trimmed);
      setNewName('');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Could not create category.');
    }
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-4 md:p-6">
      <h1 className="text-lg font-semibold text-ink-900 dark:text-white">Categories</h1>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
        Rename, merge, or delete categories. Nothing here is hard-coded — the whole classifier reads from this list.
      </p>

      <div className="mt-4 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && createCategory()}
          placeholder="New category name…"
          className="max-w-xs flex-1 rounded-lg border border-ink-200 px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-900"
        />
        <button
          type="button"
          onClick={createCategory}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus size={14} aria-hidden="true" />
          Add
        </button>
      </div>

      <div className="mt-5 divide-y divide-ink-100 rounded-xl border border-ink-100 dark:divide-ink-800 dark:border-ink-800">
        {categories.map((category) => {
          const count = countById.get(category.id)?.count ?? 0;
          const isEditing = editingId === category.id;
          const isMerging = mergingId === category.id;
          return (
            <div key={category.id} className="flex items-center gap-3 px-4 py-3">
              {isEditing ? (
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      await store.renameCategory(category.id, editingName);
                      setEditingId(null);
                    } else if (e.key === 'Escape') {
                      setEditingId(null);
                    }
                  }}
                  onBlur={() => setEditingId(null)}
                  className="flex-1 rounded border border-ink-200 px-2 py-1 text-sm dark:border-ink-700 dark:bg-ink-900"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate('search', { q: `category:${category.id}` })}
                  className="flex-1 text-left text-sm font-medium text-ink-800 hover:text-brand-600 dark:text-ink-100"
                >
                  {category.name}
                </button>
              )}

              {isMerging && (
                <select
                  autoFocus
                  onChange={async (e) => {
                    if (e.target.value) {
                      await store.mergeCategories(category.id, e.target.value);
                      setMergingId(null);
                    }
                  }}
                  className="rounded border border-ink-200 px-2 py-1 text-xs dark:border-ink-700 dark:bg-ink-900"
                >
                  <option value="">Merge into…</option>
                  {categories
                    .filter((c) => c.id !== category.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              )}

              <span className="w-16 shrink-0 text-right text-xs text-ink-400">{count.toLocaleString()}</span>

              <OverflowMenu
                items={[
                  {
                    label: 'Rename',
                    icon: Pencil,
                    onClick: () => {
                      setEditingId(category.id);
                      setEditingName(category.name);
                    },
                  },
                  { label: 'Merge into…', icon: Combine, onClick: () => setMergingId(category.id) },
                  ...(category.id !== 'other'
                    ? [
                        {
                          label: 'Delete',
                          icon: Trash2,
                          danger: true,
                          onClick: () => {
                            if (confirm(`Delete "${category.name}"? Bookmarks keep their other categories.`)) {
                              void store.deleteCategory(category.id);
                            }
                          },
                        },
                      ]
                    : []),
                ]}
              />
            </div>
          );
        })}
      </div>

      {folderSuggestions.length > 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-ink-200 p-4 dark:border-ink-700">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-800 dark:text-ink-100">
            <Lightbulb size={15} className="text-amber-500" aria-hidden="true" />
            Your folders could be simplified
          </p>
          <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
            These generically-named folders might be worth folding into a category instead. Nothing moves automatically.
          </p>
          <ul className="mt-3 space-y-1.5">
            {folderSuggestions.map((s) => (
              <li key={s.folder} className="flex items-center justify-between text-sm">
                <span className="text-ink-600 dark:text-ink-300">{s.folder}</span>
                <span className="text-ink-400">
                  {s.bookmarkCount} bookmark{s.bookmarkCount === 1 ? '' : 's'} → suggest{' '}
                  <strong className="text-ink-600 dark:text-ink-300">{s.suggestedCategory}</strong>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
