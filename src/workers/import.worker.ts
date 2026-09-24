/// <reference lib="webworker" />
import { parseBookmarkHtml } from '../lib/parser/bookmarkHtml';
import { classifyBookmark } from '../lib/classifier';
import { extractDomain, normalizeUrl } from '../lib/normalization/url';
import { createId } from '../lib/utils/id';
import type { Bookmark, Category } from '../lib/db/types';

export interface ImportWorkerRequest {
  type: 'parse';
  html: string;
  categories: Category[];
  autoCategorize: boolean;
  autoTag: boolean;
}

export interface ImportStats {
  total: number;
  folderCount: number;
  emptyFolderCount: number;
  untitledCount: number;
}

export type ImportWorkerResponse =
  | { type: 'progress'; phase: 'parsing' | 'processing'; done: number; total: number }
  | { type: 'done'; bookmarks: Bookmark[]; folders: string[]; emptyFolders: string[]; stats: ImportStats }
  | { type: 'error'; message: string };

function post(message: ImportWorkerResponse) {
  (self as unknown as { postMessage: (m: ImportWorkerResponse) => void }).postMessage(message);
}

self.onmessage = (event: MessageEvent<ImportWorkerRequest>) => {
  const { html, categories, autoCategorize, autoTag } = event.data;
  try {
    post({ type: 'progress', phase: 'parsing', done: 0, total: 1 });
    const parsed = parseBookmarkHtml(html);
    const total = parsed.bookmarks.length;
    const now = Date.now();
    const bookmarks: Bookmark[] = new Array(total);
    let untitledCount = 0;

    for (let i = 0; i < total; i++) {
      const item = parsed.bookmarks[i];
      const domain = extractDomain(item.url);
      const title = item.title || item.url;
      if (!item.title) untitledCount++;

      let categoryIds: string[] = [];
      let suggestedTagNames: string[] = [];
      if (autoCategorize || autoTag) {
        const classification = classifyBookmark({ title, url: item.url, domain, folder: item.folder }, categories);
        if (autoCategorize) categoryIds = classification.categoryIds;
        if (autoTag) suggestedTagNames = classification.suggestedTags;
      }

      bookmarks[i] = {
        id: createId(),
        url: item.url,
        normalizedUrl: normalizeUrl(item.url),
        title,
        domain,
        folder: item.folder,
        categories: categoryIds,
        // Tag *names* for now (Firefox TAGS + auto-suggestions) — the main
        // thread resolves these to canonical tag ids via the tag store.
        tags: Array.from(new Set([...(item.tags ?? []), ...suggestedTagNames])),
        icon: item.icon,
        favorite: false,
        archived: false,
        readLater: false,
        dateAdded: item.dateAdded,
        importedAt: now,
        lastModified: now,
        source: 'import',
      };

      if (i % 500 === 0 || i === total - 1) {
        post({ type: 'progress', phase: 'processing', done: i + 1, total });
      }
    }

    post({
      type: 'done',
      bookmarks,
      folders: parsed.folders,
      emptyFolders: parsed.emptyFolders,
      stats: {
        total,
        folderCount: parsed.folders.length,
        emptyFolderCount: parsed.emptyFolders.length,
        untitledCount,
      },
    });
  } catch (error) {
    post({ type: 'error', message: error instanceof Error ? error.message : 'Failed to parse bookmark file.' });
  }
};
