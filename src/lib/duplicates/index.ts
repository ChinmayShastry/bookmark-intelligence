import { normalizeUrl } from '../normalization/url';

export interface DuplicateGroup<T> {
  normalizedUrl: string;
  items: T[];
}

type UrlLike = { url: string; normalizedUrl?: string };

export function groupByNormalizedUrl<T extends UrlLike>(items: T[]): DuplicateGroup<T>[] {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = item.normalizedUrl ?? normalizeUrl(item.url);
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return [...map.entries()].map(([normalizedUrl, group]) => ({ normalizedUrl, items: group }));
}

/** Groups of two-or-more bookmarks that share a normalized URL, largest first. */
export function findDuplicateGroups<T extends UrlLike>(items: T[]): DuplicateGroup<T>[] {
  return groupByNormalizedUrl(items)
    .filter((group) => group.items.length > 1)
    .sort((a, b) => b.items.length - a.items.length);
}

/** Count of "extra copies" — total items minus one representative per group. */
export function countExtraDuplicates<T extends UrlLike>(items: T[]): number {
  return findDuplicateGroups(items).reduce((sum, group) => sum + (group.items.length - 1), 0);
}
