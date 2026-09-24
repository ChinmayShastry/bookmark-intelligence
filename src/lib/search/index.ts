import Fuse from 'fuse.js';
import { findDuplicateGroups } from '../duplicates';
import { effectiveDate } from '../selectors/stats';
import type { Bookmark, Category, Tag } from '../db/types';
import { parseSearchQuery, type SearchFilters } from './queryParser';

export { parseSearchQuery } from './queryParser';
export type { ParsedQuery, SearchFilters } from './queryParser';

export interface SearchContext {
  bookmarks: Bookmark[];
  categories: Category[];
  tags: Tag[];
  fuzzySensitivity: number;
  forgottenThresholdDays: number;
}

interface SearchableRecord {
  bookmark: Bookmark;
  tagNames: string;
  categoryNames: string;
}

function mapSensitivityToThreshold(sensitivity: number): number {
  const clamped = Math.min(1, Math.max(0, sensitivity));
  return 0.1 + clamped * 0.5;
}

function buildSearchable(bookmarks: Bookmark[], tags: Tag[], categories: Category[]): SearchableRecord[] {
  const tagNameById = new Map(tags.map((t) => [t.id, t.name]));
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));
  return bookmarks.map((bookmark) => ({
    bookmark,
    tagNames: bookmark.tags.map((id) => tagNameById.get(id) ?? id).join(' '),
    categoryNames: bookmark.categories.map((id) => categoryNameById.get(id) ?? id).join(' '),
  }));
}

function applyFilters(bookmarks: Bookmark[], filters: SearchFilters, ctx: SearchContext): Bookmark[] {
  let result = bookmarks;

  if (filters.duplicate !== undefined) {
    const duplicateIds = new Set(
      findDuplicateGroups(ctx.bookmarks).flatMap((group) => group.items.map((b) => b.id))
    );
    result = result.filter((b) => duplicateIds.has(b.id) === filters.duplicate);
  }
  if (filters.favorite !== undefined) result = result.filter((b) => b.favorite === filters.favorite);
  if (filters.archived !== undefined) result = result.filter((b) => b.archived === filters.archived);
  if (filters.readLater !== undefined) result = result.filter((b) => b.readLater === filters.readLater);
  if (filters.untagged) result = result.filter((b) => b.tags.length === 0);
  if (filters.hasNotes !== undefined) {
    result = result.filter((b) => Boolean(b.notes && b.notes.trim()) === filters.hasNotes);
  }

  if (filters.domain?.length) {
    const wanted = filters.domain;
    result = result.filter((b) => wanted.some((d) => b.domain.toLowerCase().includes(d)));
  }
  if (filters.folder?.length) {
    const wanted = filters.folder;
    result = result.filter((b) => wanted.some((f) => (b.folder ?? '').toLowerCase().includes(f)));
  }
  if (filters.category?.length) {
    const wantedIds = new Set(
      filters.category.map((token) => ctx.categories.find((c) => c.id === token || c.name.toLowerCase() === token)?.id ?? token)
    );
    result = result.filter((b) => b.categories.some((c) => wantedIds.has(c)));
  }
  if (filters.tag?.length) {
    const wantedIds = new Set(
      filters.tag.map((token) => ctx.tags.find((t) => t.id === token || t.name.toLowerCase() === token)?.id ?? token)
    );
    result = result.filter((b) => b.tags.some((t) => wantedIds.has(t)));
  }

  if (filters.before !== undefined) {
    const before = filters.before;
    result = result.filter((b) => (b.dateAdded ?? b.importedAt) < before);
  }
  if (filters.after !== undefined) {
    const after = filters.after;
    result = result.filter((b) => (b.dateAdded ?? b.importedAt) > after);
  }

  return result;
}

function sortByRecency(bookmarks: Bookmark[]): Bookmark[] {
  return [...bookmarks].sort((a, b) => (b.dateAdded ?? b.importedAt) - (a.dateAdded ?? a.importedAt));
}

// `applyFilters` returns the original array reference when no filter
// actually narrowed it, which lets this cache survive across keystrokes
// for the common case (typing free text with no operators): the Fuse
// index for a 50,000-bookmark library is built once, not on every
// keystroke. Combined with debouncing the input in the UI, this keeps
// typical searches comfortably under the <100ms target without needing a
// dedicated search Web Worker (the in-memory bookmark array already lives
// on the main thread as the app's single source of truth).
let cachedCandidates: Bookmark[] | null = null;
let cachedThreshold: number | null = null;
let cachedFuse: Fuse<SearchableRecord> | null = null;

function getOrBuildFuse(candidates: Bookmark[], tags: Tag[], categories: Category[], threshold: number): Fuse<SearchableRecord> {
  if (cachedFuse && cachedCandidates === candidates && cachedThreshold === threshold) {
    return cachedFuse;
  }
  const searchable = buildSearchable(candidates, tags, categories);
  const fuse = new Fuse(searchable, {
    keys: [
      { name: 'bookmark.title', weight: 0.35 },
      { name: 'tagNames', weight: 0.2 },
      { name: 'categoryNames', weight: 0.15 },
      { name: 'bookmark.domain', weight: 0.15 },
      { name: 'bookmark.folder', weight: 0.1 },
      { name: 'bookmark.notes', weight: 0.1 },
      { name: 'bookmark.url', weight: 0.05 },
    ],
    threshold,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });
  cachedCandidates = candidates;
  cachedThreshold = threshold;
  cachedFuse = fuse;
  return fuse;
}

/**
 * Instant, local, fuzzy + filtered search. Supports operators (tag:,
 * domain:, category:, favorite:, duplicate:, before:, after:, ...) and
 * smart keywords (duplicates, untagged, favorites, recent, old) — see
 * queryParser.ts. No network calls; everything runs over the in-memory
 * bookmark array already loaded from IndexedDB.
 */
export function searchBookmarks(rawQuery: string, ctx: SearchContext): Bookmark[] {
  const domains = Array.from(new Set(ctx.bookmarks.map((b) => b.domain)));
  const parsed = parseSearchQuery(rawQuery, { categories: ctx.categories, domains });

  let candidates = applyFilters(ctx.bookmarks, parsed.filters, ctx);

  if (parsed.recent) {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    candidates = candidates.filter((b) => (b.dateAdded ?? b.importedAt) >= cutoff);
  }
  if (parsed.old) {
    const cutoff = Date.now() - ctx.forgottenThresholdDays * 24 * 60 * 60 * 1000;
    candidates = candidates.filter((b) => effectiveDate(b) < cutoff);
  }

  if (!parsed.freeText) {
    return sortByRecency(candidates);
  }

  const fuse = getOrBuildFuse(candidates, ctx.tags, ctx.categories, mapSensitivityToThreshold(ctx.fuzzySensitivity));
  return fuse.search(parsed.freeText).map((result) => result.item.bookmark);
}
