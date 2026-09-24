import { Star, Archive, ArchiveRestore, Trash2, Copy, Pencil, BookOpenCheck, ExternalLink } from 'lucide-react';
import { Favicon } from '../common/Favicon';
import { SafeExternalLink } from '../common/SafeExternalLink';
import { OverflowMenu } from '../common/OverflowMenu';
import type { Bookmark, Category, Tag } from '../../lib/db/types';

export const BOOKMARK_ROW_HEIGHT = 60;

interface BookmarkCardProps {
  bookmark: Bookmark;
  categories: Category[];
  tags: Tag[];
  selected: boolean;
  onToggleSelect: () => void;
  onOpenDetail: () => void;
  onToggleFavorite: () => void;
  onToggleArchive: () => void;
  onDelete: () => void;
  onCopyUrl: () => void;
  onToggleReadLater: () => void;
}

export function BookmarkCard({
  bookmark,
  categories,
  tags,
  selected,
  onToggleSelect,
  onOpenDetail,
  onToggleFavorite,
  onToggleArchive,
  onDelete,
  onCopyUrl,
  onToggleReadLater,
}: BookmarkCardProps) {
  const categoryNames = bookmark.categories
    .map((id) => categories.find((c) => c.id === id)?.name)
    .filter((n): n is string => Boolean(n));
  const tagNames = bookmark.tags.map((id) => tags.find((t) => t.id === id)?.name).filter((n): n is string => Boolean(n));
  const dateLabel = bookmark.dateAdded
    ? new Date(bookmark.dateAdded).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <div
      style={{ height: BOOKMARK_ROW_HEIGHT }}
      className="group flex items-center gap-3 border-b border-ink-100 px-3 dark:border-ink-800/70"
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggleSelect}
        aria-label={`Select ${bookmark.title || bookmark.url}`}
        className="h-4 w-4 shrink-0 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
      />

      <button type="button" onClick={onOpenDetail} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <Favicon icon={bookmark.icon} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-sm font-medium text-ink-900 dark:text-white">
            {bookmark.archived && (
              <Archive size={12} className="shrink-0 text-ink-400" aria-label="Archived" />
            )}
            {bookmark.title || bookmark.url}
          </p>
          <p className="truncate text-xs text-ink-500 dark:text-ink-400">
            {bookmark.domain}
            {categoryNames[0] && <span> · {categoryNames[0]}</span>}
            {bookmark.folder && <span className="hidden sm:inline"> · {bookmark.folder}</span>}
          </p>
        </div>
      </button>

      <div className="hidden max-w-[26%] flex-wrap items-center gap-1 lg:flex">
        {tagNames.slice(0, 2).map((name) => (
          <span
            key={name}
            className="whitespace-nowrap rounded-full bg-ink-100 px-2 py-0.5 text-[11px] text-ink-600 dark:bg-ink-800 dark:text-ink-300"
          >
            {name}
          </span>
        ))}
        {tagNames.length > 2 && <span className="text-[11px] text-ink-400">+{tagNames.length - 2}</span>}
      </div>

      <span className="hidden w-24 shrink-0 text-right text-xs text-ink-400 sm:block">{dateLabel}</span>

      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={bookmark.favorite ? 'Remove favorite' : 'Add favorite'}
          className={`rounded-md p-1.5 transition ${
            bookmark.favorite ? 'text-amber-500' : 'text-ink-300 hover:text-ink-500 dark:text-ink-600'
          }`}
        >
          <Star size={16} fill={bookmark.favorite ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
        <SafeExternalLink
          url={bookmark.url}
          aria-label="Open bookmark"
          className="flex items-center rounded-md p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800 dark:hover:text-ink-200"
        >
          <ExternalLink size={16} aria-hidden="true" />
        </SafeExternalLink>
        <OverflowMenu
          items={[
            { label: 'Edit', icon: Pencil, onClick: onOpenDetail },
            { label: 'Copy URL', icon: Copy, onClick: onCopyUrl },
            {
              label: bookmark.readLater ? 'Remove from Reading Queue' : 'Add to Reading Queue',
              icon: BookOpenCheck,
              onClick: onToggleReadLater,
            },
            {
              label: bookmark.archived ? 'Unarchive' : 'Archive',
              icon: bookmark.archived ? ArchiveRestore : Archive,
              onClick: onToggleArchive,
            },
            { label: 'Delete', icon: Trash2, onClick: onDelete, danger: true },
          ]}
        />
      </div>
    </div>
  );
}
