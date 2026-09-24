import type { AppSettings, Bookmark, Category, Collection, Tag } from '../db/types';

export const BACKUP_VERSION = 1;

export interface BackupFile {
  version: number;
  createdAt: number;
  bookmarks: Bookmark[];
  categories: Category[];
  tags: Tag[];
  collections: Collection[];
  settings: AppSettings;
}

export class CorruptBackupError extends Error {
  constructor(message = 'This backup appears incomplete.') {
    super(message);
    this.name = 'CorruptBackupError';
  }
}

export function createBackupFile(data: {
  bookmarks: Bookmark[];
  categories: Category[];
  tags: Tag[];
  collections: Collection[];
  settings: AppSettings;
}): string {
  const file: BackupFile = { version: BACKUP_VERSION, createdAt: Date.now(), ...data };
  return JSON.stringify(file, null, 2);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function parseBackupFile(text: string): BackupFile {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new CorruptBackupError();
  }

  if (
    !isRecord(data) ||
    !Array.isArray(data.bookmarks) ||
    !Array.isArray(data.categories) ||
    !Array.isArray(data.tags) ||
    !isRecord(data.settings)
  ) {
    throw new CorruptBackupError();
  }

  return {
    version: typeof data.version === 'number' ? data.version : 1,
    createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
    bookmarks: data.bookmarks as Bookmark[],
    categories: data.categories as Category[],
    tags: data.tags as Tag[],
    collections: Array.isArray(data.collections) ? (data.collections as Collection[]) : [],
    settings: data.settings as unknown as AppSettings,
  };
}
