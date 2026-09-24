import { useState } from 'react';
import { Star, Archive, Trash2, Download, Tag as TagIcon, X } from 'lucide-react';
import { useAppState, useAppStore } from '../../lib/store/hooks';
import { bookmarksToJson } from '../../lib/export/formats';
import { downloadFile } from '../../lib/export/downloadFile';
import type { Bookmark } from '../../lib/db/types';

interface BulkActionBarProps {
  selectedIds: string[];
  bookmarks: Bookmark[];
  onClear: () => void;
}

export function BulkActionBar({ selectedIds, bookmarks, onClear }: BulkActionBarProps) {
  const store = useAppStore();
  const categories = useAppState((s) => s.categories);
  const tags = useAppState((s) => s.tags);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  if (selectedIds.length === 0) return null;

  const selected = bookmarks.filter((b) => selectedIds.includes(b.id));

  const addTagToSelection = async () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    const [id] = await store.ensureTags([trimmed]);
    await store.updateBookmarks(selectedIds, (b) => ({ tags: id && !b.tags.includes(id) ? [...b.tags, id] : b.tags }));
    setTagInput('');
    setShowTagInput(false);
  };

  return (
    <div className="sticky bottom-0 z-20 flex flex-wrap items-center gap-2 border-t border-ink-200 bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] dark:border-ink-700 dark:bg-ink-900">
      <span className="text-sm font-medium text-ink-700 dark:text-ink-200">{selectedIds.length} selected</span>

      <ActionButton icon={Star} label="Favorite" onClick={() => store.updateBookmarks(selectedIds, { favorite: true })} />
      <ActionButton icon={Archive} label="Archive" onClick={() => store.updateBookmarks(selectedIds, { archived: true })} />

      <div className="relative">
        <ActionButton icon={TagIcon} label="Add tag" onClick={() => setShowTagInput((v) => !v)} />
        {showTagInput && (
          <div className="absolute bottom-full left-0 mb-2 flex items-center gap-1 rounded-lg border border-ink-200 bg-white p-1.5 shadow-lg dark:border-ink-700 dark:bg-ink-900">
            <input
              autoFocus
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTagToSelection()}
              placeholder="Tag name"
              className="w-28 rounded border border-ink-200 px-2 py-1 text-xs dark:border-ink-700 dark:bg-ink-800"
            />
            <button type="button" onClick={addTagToSelection} className="rounded bg-brand-600 px-2 py-1 text-xs font-medium text-white">
              Add
            </button>
          </div>
        )}
      </div>

      <ActionButton
        icon={Download}
        label="Export"
        onClick={() => downloadFile('bookmark-intelligence-selection.json', bookmarksToJson(selected, categories, tags), 'application/json')}
      />
      <ActionButton
        icon={Trash2}
        label="Delete"
        danger
        onClick={() => {
          if (confirm(`Delete ${selectedIds.length} bookmark(s)? This can't be undone.`)) {
            void store.deleteBookmarks(selectedIds);
            onClear();
          }
        }}
      />

      <button
        type="button"
        onClick={onClear}
        className="ml-auto flex items-center gap-1 text-xs font-medium text-ink-400 hover:text-ink-700 dark:hover:text-ink-200"
      >
        <X size={13} aria-hidden="true" />
        Clear selection
      </button>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Star;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
        danger
          ? 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/20'
          : 'border-ink-200 text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800'
      }`}
    >
      <Icon size={13} aria-hidden="true" />
      {label}
    </button>
  );
}
