import { describe, expect, it } from 'vitest';
import { createBackupFile, parseBackupFile, CorruptBackupError } from '../src/lib/backup';
import { DEFAULT_SETTINGS } from '../src/lib/db/types';
import { generateDemoBookmarks } from '../src/lib/demo/generateDemoData';
import { buildDefaultCategories } from '../src/lib/classifier/defaultCategories';

describe('backup roundtrip', () => {
  it('serializes and parses back an equivalent structure', () => {
    const bookmarks = generateDemoBookmarks();
    const categories = buildDefaultCategories();
    const json = createBackupFile({ bookmarks, categories, tags: [], collections: [], settings: DEFAULT_SETTINGS });
    const parsed = parseBackupFile(json);

    expect(parsed.bookmarks).toHaveLength(bookmarks.length);
    expect(parsed.categories).toHaveLength(categories.length);
    expect(parsed.settings.theme).toBe(DEFAULT_SETTINGS.theme);
    expect(parsed.bookmarks[0].url).toBe(bookmarks[0].url);
  });

  it('rejects invalid JSON', () => {
    expect(() => parseBackupFile('{not json')).toThrow(CorruptBackupError);
  });

  it('rejects a JSON file missing required fields', () => {
    expect(() => parseBackupFile(JSON.stringify({ foo: 'bar' }))).toThrow(CorruptBackupError);
  });

  it('defaults missing collections to an empty array for older backups', () => {
    const json = JSON.stringify({
      version: 1,
      createdAt: Date.now(),
      bookmarks: [],
      categories: [],
      tags: [],
      settings: DEFAULT_SETTINGS,
    });
    const parsed = parseBackupFile(json);
    expect(parsed.collections).toEqual([]);
  });
});
