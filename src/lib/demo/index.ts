import { resolveBookmarkTagNames } from '../store/resolveTags';
import { generateDemoBookmarks } from './generateDemoData';
import type { AppStore } from '../store/appStore';

export { generateDemoBookmarks } from './generateDemoData';

export async function loadDemoData(store: AppStore): Promise<void> {
  const bookmarks = generateDemoBookmarks();
  const resolved = await resolveBookmarkTagNames(bookmarks, store);
  await store.addBookmarks(resolved);
}
