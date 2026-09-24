import { useMemo, useState } from 'react';
import { Plus, Pencil, Combine, Trash2 } from 'lucide-react';
import { useAppState, useAppStore } from '../../lib/store/hooks';
import { OverflowMenu } from '../common/OverflowMenu';

interface TagsViewProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

export function TagsView({ onNavigate }: TagsViewProps) {
  const bookmarks = useAppState((s) => s.bookmarks);
  const tags = useAppState((s) => s.tags);
  const store = useAppStore();

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [mergingId, setMergingId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const bookmark of bookmarks) {
      for (const tagId of bookmark.tags) map.set(tagId, (map.get(tagId) ?? 0) + 1);
    }
    return map;
  }, [bookmarks]);

  const sortedTags = useMemo(
    () => [...tags].sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0)),
    [tags, counts]
  );

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-4 md:p-6">
      <h1 className="text-lg font-semibold text-ink-900 dark:text-white">Tags</h1>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
        {tags.length} tag{tags.length === 1 ? '' : 's'} across your library.
      </p>

      <div className="mt-4 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === 'Enter' && newName.trim()) {
              await store.ensureTags([newName.trim()]);
              setNewName('');
            }
          }}
          placeholder="New tag name…"
          className="max-w-xs flex-1 rounded-lg border border-ink-200 px-3 py-2 text-sm dark:border-ink-700 dark:bg-ink-900"
        />
        <button
          type="button"
          onClick={async () => {
            if (newName.trim()) {
              await store.ensureTags([newName.trim()]);
              setNewName('');
            }
          }}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus size={14} aria-hidden="true" />
          Add
        </button>
      </div>

      {sortedTags.length === 0 ? (
        <p className="mt-8 text-center text-sm text-ink-400">No tags yet. Add one from a bookmark's detail panel.</p>
      ) : (
        <div className="mt-5 divide-y divide-ink-100 rounded-xl border border-ink-100 dark:divide-ink-800 dark:border-ink-800">
          {sortedTags.map((tag) => {
            const count = counts.get(tag.id) ?? 0;
            const isEditing = editingId === tag.id;
            const isMerging = mergingId === tag.id;
            return (
              <div key={tag.id} className="flex items-center gap-3 px-4 py-3">
                {isEditing ? (
                  <input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        await store.renameTag(tag.id, editingName);
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
                    onClick={() => onNavigate('search', { q: `tag:${tag.id}` })}
                    className="flex-1 text-left text-sm font-medium text-ink-800 hover:text-brand-600 dark:text-ink-100"
                  >
                    #{tag.name}
                  </button>
                )}

                {isMerging && (
                  <select
                    autoFocus
                    onChange={async (e) => {
                      if (e.target.value) {
                        await store.mergeTags(tag.id, e.target.value);
                        setMergingId(null);
                      }
                    }}
                    className="rounded border border-ink-200 px-2 py-1 text-xs dark:border-ink-700 dark:bg-ink-900"
                  >
                    <option value="">Merge into…</option>
                    {tags
                      .filter((t) => t.id !== tag.id)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
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
                        setEditingId(tag.id);
                        setEditingName(tag.name);
                      },
                    },
                    { label: 'Merge into…', icon: Combine, onClick: () => setMergingId(tag.id) },
                    {
                      label: 'Delete',
                      icon: Trash2,
                      danger: true,
                      onClick: () => {
                        if (confirm(`Delete tag "${tag.name}"?`)) void store.deleteTag(tag.id);
                      },
                    },
                  ]}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
