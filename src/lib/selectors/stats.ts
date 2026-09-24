import { countExtraDuplicates } from '../duplicates';
import { analyzeFolders } from '../classifier/folderIntelligence';
import type { Bookmark, Category } from '../db/types';

const DAY_MS = 24 * 60 * 60 * 1000;

export function getBasicStats(bookmarks: Bookmark[]) {
  const now = Date.now();
  const monthAgo = now - 30 * DAY_MS;
  const domains = new Set(bookmarks.map((b) => b.domain));
  return {
    total: bookmarks.length,
    duplicates: countExtraDuplicates(bookmarks),
    untagged: bookmarks.filter((b) => b.tags.length === 0).length,
    domains: domains.size,
    addedThisMonth: bookmarks.filter((b) => (b.dateAdded ?? b.importedAt) >= monthAgo).length,
    favorites: bookmarks.filter((b) => b.favorite).length,
    archived: bookmarks.filter((b) => b.archived).length,
    readLater: bookmarks.filter((b) => b.readLater && !b.readLaterDone).length,
    categories: new Set(bookmarks.flatMap((b) => b.categories)).size,
  };
}

export interface CategoryCount {
  categoryId: string;
  name: string;
  count: number;
  percentage: number;
}

export function getCategoryCounts(bookmarks: Bookmark[], categories: Category[]): CategoryCount[] {
  const nameById = new Map(categories.map((c) => [c.id, c.name]));
  const counts = new Map<string, number>();
  for (const bookmark of bookmarks) {
    for (const categoryId of bookmark.categories) {
      counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1);
    }
  }
  const total = bookmarks.length || 1;
  return [...counts.entries()]
    .map(([categoryId, count]) => ({
      categoryId,
      name: nameById.get(categoryId) ?? categoryId,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

export interface DomainCount {
  domain: string;
  count: number;
  percentage: number;
  topCategories: string[];
}

export function getDomainCounts(bookmarks: Bookmark[], categories: Category[]): DomainCount[] {
  const nameById = new Map(categories.map((c) => [c.id, c.name]));
  const byDomain = new Map<string, Bookmark[]>();
  for (const bookmark of bookmarks) {
    const list = byDomain.get(bookmark.domain) ?? [];
    list.push(bookmark);
    byDomain.set(bookmark.domain, list);
  }
  const total = bookmarks.length || 1;
  return [...byDomain.entries()]
    .map(([domain, items]) => {
      const categoryCounts = new Map<string, number>();
      for (const item of items) {
        for (const categoryId of item.categories) {
          categoryCounts.set(categoryId, (categoryCounts.get(categoryId) ?? 0) + 1);
        }
      }
      const topCategories = [...categoryCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([id]) => nameById.get(id) ?? id);
      return {
        domain,
        count: items.length,
        percentage: Math.round((items.length / total) * 100),
        topCategories,
      };
    })
    .sort((a, b) => b.count - a.count);
}

export interface HealthBreakdown {
  organization: number;
  duplicates: number;
  tagging: number;
  activity: number;
  folderStructure: number;
  total: number;
}

/**
 * Transparent, deterministic health score (0-100 across five 20-point
 * pillars). Never touches an AI model — every point is traceable to a
 * measurable property of the library.
 */
export function computeHealthScore(
  bookmarks: Bookmark[],
  categories: Category[],
  forgottenThresholdDays: number
): HealthBreakdown {
  const total = bookmarks.length;
  if (total === 0) {
    return { organization: 0, duplicates: 0, tagging: 0, activity: 0, folderStructure: 0, total: 0 };
  }

  const categorized = bookmarks.filter((b) => b.categories.some((c) => c !== 'other')).length;
  const organization = Math.round(20 * (categorized / total));

  const extraDuplicates = countExtraDuplicates(bookmarks);
  const duplicateRatio = Math.min(1, extraDuplicates / total);
  const duplicates = Math.round(20 * (1 - duplicateRatio));

  const tagged = bookmarks.filter((b) => b.tags.length > 0).length;
  const tagging = Math.round(20 * (tagged / total));

  const cutoff = Date.now() - forgottenThresholdDays * DAY_MS;
  const forgotten = bookmarks.filter(
    (b) => !b.favorite && !b.archived && (b.dateAdded ?? b.importedAt) < cutoff
  ).length;
  const activity = Math.round(20 * (1 - Math.min(1, forgotten / total)));

  const foldered = bookmarks.filter((b) => b.folder);
  const messyFolders = new Set(analyzeFolders(bookmarks, categories).map((f) => f.folder));
  const messyCount = foldered.filter((b) => b.folder && messyFolders.has(b.folder)).length;
  const folderStructure = foldered.length === 0 ? 20 : Math.round(20 * (1 - messyCount / foldered.length));

  return {
    organization,
    duplicates,
    tagging,
    activity,
    folderStructure,
    total: organization + duplicates + tagging + activity + folderStructure,
  };
}

export function getForgottenBookmarks(bookmarks: Bookmark[], thresholdDays: number): Bookmark[] {
  const cutoff = Date.now() - thresholdDays * DAY_MS;
  return bookmarks
    .filter((b) => !b.archived && (b.dateAdded ?? b.importedAt) < cutoff)
    .sort((a, b) => (a.dateAdded ?? a.importedAt) - (b.dateAdded ?? b.importedAt));
}
