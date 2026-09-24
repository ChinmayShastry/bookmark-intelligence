import { describe, expect, it } from 'vitest';
import { generateDemoBookmarks } from '../src/lib/demo/generateDemoData';
import { countExtraDuplicates } from '../src/lib/duplicates';

describe('generateDemoBookmarks', () => {
  it('produces a realistic, sizeable dataset', () => {
    const bookmarks = generateDemoBookmarks();
    expect(bookmarks.length).toBeGreaterThanOrEqual(95);
    expect(bookmarks.length).toBeLessThanOrEqual(115);
  });

  it('is deterministic across calls', () => {
    const now = Date.now();
    const a = generateDemoBookmarks(20260101, now);
    const b = generateDemoBookmarks(20260101, now);
    expect(a.map((x) => x.url)).toEqual(b.map((x) => x.url));
    expect(a.map((x) => x.dateAdded)).toEqual(b.map((x) => x.dateAdded));
  });

  it('includes real duplicates', () => {
    const bookmarks = generateDemoBookmarks();
    expect(countExtraDuplicates(bookmarks)).toBeGreaterThan(0);
  });

  it('includes untagged, favorite, and read-later bookmarks', () => {
    const bookmarks = generateDemoBookmarks();
    expect(bookmarks.some((b) => b.tags.length === 0)).toBe(true);
    expect(bookmarks.some((b) => b.favorite)).toBe(true);
    expect(bookmarks.some((b) => b.readLater)).toBe(true);
  });

  it('spans old and recent bookmarks for forgotten-bookmark thresholds', () => {
    const bookmarks = generateDemoBookmarks();
    const now = Date.now();
    const yearMs = 365 * 24 * 60 * 60 * 1000;
    expect(bookmarks.some((b) => (b.dateAdded ?? now) < now - 2 * yearMs)).toBe(true);
    expect(bookmarks.some((b) => (b.dateAdded ?? 0) > now - 14 * 24 * 60 * 60 * 1000)).toBe(true);
  });

  it('every bookmark gets a real category assignment', () => {
    const bookmarks = generateDemoBookmarks();
    expect(bookmarks.every((b) => b.categories.length > 0)).toBe(true);
  });
});
