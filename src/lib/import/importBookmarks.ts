import { countExtraDuplicates } from '../duplicates';
import { InvalidBookmarkFileError } from '../parser/bookmarkHtml';
import { resolveBookmarkTagNames } from '../store/resolveTags';
import type { AppStore } from '../store/appStore';
import type { Bookmark, Category } from '../db/types';
import type { ImportStats, ImportWorkerRequest, ImportWorkerResponse } from '../../workers/import.worker';

export class UnsupportedFileError extends Error {
  constructor(message = 'Please choose a browser bookmark HTML file.') {
    super(message);
    this.name = 'UnsupportedFileError';
  }
}

export interface ImportPreviewStats extends ImportStats {
  duplicateCount: number;
}

export interface ImportPreview {
  bookmarks: Bookmark[];
  folders: string[];
  emptyFolders: string[];
  stats: ImportPreviewStats;
}

export function isLikelyBookmarkFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith('.html') || name.endsWith('.htm') || file.type === 'text/html';
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Could not read the file.'));
    reader.readAsText(file);
  });
}

export interface ImportOptions {
  categories: Category[];
  autoCategorize: boolean;
  autoTag: boolean;
  existingBookmarks: Bookmark[];
  onProgress?: (phase: 'parsing' | 'processing', done: number, total: number) => void;
}

/**
 * Parses + classifies a bookmark HTML export inside a Web Worker so a
 * 10,000+ bookmark file never freezes the UI. Nothing is written to
 * IndexedDB here — this only builds the preview the user confirms next.
 */
export async function buildImportPreview(file: File, options: ImportOptions): Promise<ImportPreview> {
  if (!isLikelyBookmarkFile(file)) {
    throw new UnsupportedFileError();
  }

  const html = await readFileAsText(file);

  const worker = new Worker(new URL('../../workers/import.worker.ts', import.meta.url), { type: 'module' });

  try {
    const result = await new Promise<{
      bookmarks: Bookmark[];
      folders: string[];
      emptyFolders: string[];
      stats: ImportStats;
    }>((resolve, reject) => {
      worker.onmessage = (event: MessageEvent<ImportWorkerResponse>) => {
        const message = event.data;
        if (message.type === 'progress') {
          options.onProgress?.(message.phase, message.done, message.total);
        } else if (message.type === 'done') {
          resolve(message);
        } else if (message.type === 'error') {
          reject(new InvalidBookmarkFileError(message.message));
        }
      };
      worker.onerror = (event) => reject(new Error(event.message || 'Failed to parse bookmark file.'));

      const request: ImportWorkerRequest = {
        type: 'parse',
        html,
        categories: options.categories,
        autoCategorize: options.autoCategorize,
        autoTag: options.autoTag,
      };
      worker.postMessage(request);
    });

    const before = countExtraDuplicates(options.existingBookmarks);
    const after = countExtraDuplicates([...options.existingBookmarks, ...result.bookmarks]);

    return {
      bookmarks: result.bookmarks,
      folders: result.folders,
      emptyFolders: result.emptyFolders,
      stats: { ...result.stats, duplicateCount: Math.max(0, after - before) },
    };
  } finally {
    worker.terminate();
  }
}

/** Persists a confirmed preview to IndexedDB, resolving tag names to ids first. */
export async function commitImportPreview(
  preview: ImportPreview,
  store: AppStore,
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  const resolved = await resolveBookmarkTagNames(preview.bookmarks, store);
  await store.addBookmarks(resolved, onProgress);
}
