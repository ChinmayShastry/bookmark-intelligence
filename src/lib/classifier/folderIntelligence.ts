import type { Bookmark, Category } from '../db/types';

const GENERIC_FOLDER_NAMES = new Set([
  'misc',
  'miscellaneous',
  'stuff',
  'random',
  'new folder',
  'other',
  'untitled',
  'imported',
  'imported bookmarks',
  'temp',
  'temporary',
  'unsorted',
  'old',
  'old bookmarks',
  'junk',
  'uncategorized',
  'to sort',
]);

export interface FolderSuggestion {
  folder: string;
  bookmarkCount: number;
  suggestedCategory: string;
}

/**
 * Flags folders with vague, low-signal names and points at the category
 * their own bookmarks were classified into most often. Purely advisory —
 * nothing here moves or renames a bookmark automatically.
 */
export function analyzeFolders(bookmarks: Bookmark[], categories: Category[]): FolderSuggestion[] {
  const byFolder = new Map<string, Bookmark[]>();
  for (const bookmark of bookmarks) {
    if (!bookmark.folder) continue;
    const leaf = bookmark.folder.split(' / ').pop()?.trim().toLowerCase() ?? '';
    if (!GENERIC_FOLDER_NAMES.has(leaf)) continue;
    const list = byFolder.get(bookmark.folder) ?? [];
    list.push(bookmark);
    byFolder.set(bookmark.folder, list);
  }

  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));
  const suggestions: FolderSuggestion[] = [];

  for (const [folder, items] of byFolder) {
    const counts = new Map<string, number>();
    for (const item of items) {
      for (const categoryId of item.categories) {
        counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1);
      }
    }
    let bestCategoryId = 'other';
    let bestCount = -1;
    for (const [categoryId, count] of counts) {
      if (count > bestCount) {
        bestCategoryId = categoryId;
        bestCount = count;
      }
    }
    suggestions.push({
      folder,
      bookmarkCount: items.length,
      suggestedCategory: categoryNameById.get(bestCategoryId) ?? 'Other',
    });
  }

  return suggestions.sort((a, b) => b.bookmarkCount - a.bookmarkCount);
}
