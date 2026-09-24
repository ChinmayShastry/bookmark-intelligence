import { useMemo } from 'react';
import { X } from 'lucide-react';
import { useAppState } from '../../lib/store/hooks';
import type { Bookmark } from '../../lib/db/types';

export interface BookmarkFilters {
  category: string;
  domain: string;
  tag: string;
  favorite: boolean;
  readLater: boolean;
  duplicate: boolean;
  hasNotes: boolean;
  archived: 'hide' | 'only' | 'all';
}

export const DEFAULT_FILTERS: BookmarkFilters = {
  category: '',
  domain: '',
  tag: '',
  favorite: false,
  readLater: false,
  duplicate: false,
  hasNotes: false,
  archived: 'hide',
};

export function filtersToQuerySuffix(filters: BookmarkFilters): string {
  const parts: string[] = [];
  if (filters.category) parts.push(`category:${filters.category}`);
  if (filters.domain) parts.push(`domain:${filters.domain}`);
  if (filters.tag) parts.push(`tag:${filters.tag}`);
  if (filters.favorite) parts.push('favorite:true');
  if (filters.readLater) parts.push('readLater:true');
  if (filters.duplicate) parts.push('duplicate:true');
  if (filters.hasNotes) parts.push('notes:true');
  if (filters.archived === 'hide') parts.push('archived:false');
  if (filters.archived === 'only') parts.push('archived:true');
  return parts.join(' ');
}

function isActive(filters: BookmarkFilters): boolean {
  return JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);
}

interface BookmarkFilterBarProps {
  bookmarks: Bookmark[];
  filters: BookmarkFilters;
  onChange: (filters: BookmarkFilters) => void;
}

export function BookmarkFilterBar({ bookmarks, filters, onChange }: BookmarkFilterBarProps) {
  const categories = useAppState((s) => s.categories);
  const tags = useAppState((s) => s.tags);

  const domains = useMemo(() => [...new Set(bookmarks.map((b) => b.domain))].sort(), [bookmarks]);

  const set = <K extends keyof BookmarkFilters>(key: K, value: BookmarkFilters[K]) => onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 px-4 py-2.5 dark:border-ink-800">
      <select
        value={filters.category}
        onChange={(e) => set('category', e.target.value)}
        aria-label="Filter by category"
        className="rounded-md border border-ink-200 bg-white px-2 py-1.5 text-xs text-ink-600 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={filters.domain}
        onChange={(e) => set('domain', e.target.value)}
        aria-label="Filter by domain"
        className="rounded-md border border-ink-200 bg-white px-2 py-1.5 text-xs text-ink-600 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300"
      >
        <option value="">All domains</option>
        {domains.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <select
        value={filters.tag}
        onChange={(e) => set('tag', e.target.value)}
        aria-label="Filter by tag"
        className="rounded-md border border-ink-200 bg-white px-2 py-1.5 text-xs text-ink-600 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300"
      >
        <option value="">All tags</option>
        {tags.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      <select
        value={filters.archived}
        onChange={(e) => set('archived', e.target.value as BookmarkFilters['archived'])}
        aria-label="Archived filter"
        className="rounded-md border border-ink-200 bg-white px-2 py-1.5 text-xs text-ink-600 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300"
      >
        <option value="hide">Active only</option>
        <option value="only">Archived only</option>
        <option value="all">All</option>
      </select>

      <FilterToggle label="Favorites" active={filters.favorite} onClick={() => set('favorite', !filters.favorite)} />
      <FilterToggle label="Read later" active={filters.readLater} onClick={() => set('readLater', !filters.readLater)} />
      <FilterToggle label="Duplicates" active={filters.duplicate} onClick={() => set('duplicate', !filters.duplicate)} />
      <FilterToggle label="Has notes" active={filters.hasNotes} onClick={() => set('hasNotes', !filters.hasNotes)} />

      {isActive(filters) && (
        <button
          type="button"
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="flex items-center gap-1 text-xs font-medium text-ink-400 hover:text-ink-700 dark:hover:text-ink-200"
        >
          <X size={12} aria-hidden="true" />
          Clear filters
        </button>
      )}
    </div>
  );
}

function FilterToggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
        active
          ? 'border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-500/40 dark:bg-brand-500/15 dark:text-brand-300'
          : 'border-ink-200 text-ink-500 hover:border-ink-300 dark:border-ink-700 dark:text-ink-400'
      }`}
    >
      {label}
    </button>
  );
}
