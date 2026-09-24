import { slugify } from '../utils/id';
import type { AppStore } from './appStore';
import type { Bookmark } from '../db/types';

/**
 * Bookmarks arrive from the import worker / demo generator with `tags` as
 * raw display names. This ensures a Tag record exists for each one and
 * rewrites `tags` to the canonical slug ids the rest of the app expects.
 */
export async function resolveBookmarkTagNames(bookmarks: Bookmark[], store: AppStore): Promise<Bookmark[]> {
  const allNames = new Set<string>();
  for (const bookmark of bookmarks) {
    for (const tag of bookmark.tags) allNames.add(tag);
  }
  if (allNames.size) {
    await store.ensureTags([...allNames]);
  }
  return bookmarks.map((bookmark) => ({
    ...bookmark,
    tags: Array.from(new Set(bookmark.tags.map((name) => slugify(name)))),
  }));
}
