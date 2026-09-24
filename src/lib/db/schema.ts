import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { AppMetadata, AppSettings, BackupRecord, Bookmark, Category, Collection, Tag } from './types';

export const DB_NAME = 'bookmark-intelligence';
export const DB_VERSION = 1;

export interface BookmarkIntelligenceDB extends DBSchema {
  bookmarks: {
    key: string;
    value: Bookmark;
    indexes: {
      domain: string;
      normalizedUrl: string;
      favorite: number;
      archived: number;
      readLater: number;
      dateAdded: number;
      importedAt: number;
    };
  };
  categories: {
    key: string;
    value: Category;
  };
  tags: {
    key: string;
    value: Tag;
  };
  collections: {
    key: string;
    value: Collection;
  };
  settings: {
    key: string;
    value: AppSettings;
  };
  backups: {
    key: string;
    value: BackupRecord;
    indexes: { createdAt: number };
  };
  metadata: {
    key: string;
    value: AppMetadata;
  };
}

let dbPromise: Promise<IDBPDatabase<BookmarkIntelligenceDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<BookmarkIntelligenceDB>> {
  if (!dbPromise) {
    dbPromise = openDB<BookmarkIntelligenceDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('bookmarks')) {
          const store = db.createObjectStore('bookmarks', { keyPath: 'id' });
          store.createIndex('domain', 'domain');
          store.createIndex('normalizedUrl', 'normalizedUrl');
          store.createIndex('favorite', 'favorite');
          store.createIndex('archived', 'archived');
          store.createIndex('readLater', 'readLater');
          store.createIndex('dateAdded', 'dateAdded');
          store.createIndex('importedAt', 'importedAt');
        }
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('tags')) {
          db.createObjectStore('tags', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('collections')) {
          db.createObjectStore('collections', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('backups')) {
          const backups = db.createObjectStore('backups', { keyPath: 'id' });
          backups.createIndex('createdAt', 'createdAt');
        }
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

export async function isStorageAvailable(): Promise<boolean> {
  try {
    if (!('indexedDB' in window)) return false;
    await getDB();
    return true;
  } catch {
    return false;
  }
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(
    ['bookmarks', 'categories', 'tags', 'collections', 'settings', 'backups', 'metadata'],
    'readwrite'
  );
  await Promise.all([
    tx.objectStore('bookmarks').clear(),
    tx.objectStore('categories').clear(),
    tx.objectStore('tags').clear(),
    tx.objectStore('collections').clear(),
    tx.objectStore('settings').clear(),
    tx.objectStore('backups').clear(),
    tx.objectStore('metadata').clear(),
    tx.done,
  ]);
}
