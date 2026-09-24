import { classifyBookmark } from '../classifier';
import { buildDefaultCategories } from '../classifier/defaultCategories';
import { extractDomain, normalizeUrl } from '../normalization/url';
import { createId } from '../utils/id';
import type { Bookmark } from '../db/types';
import { DEMO_DUPLICATE_TARGETS, DEMO_ENTRIES, DEMO_NOTES } from './demoEntries';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Deterministic PRNG (mulberry32) so the demo dataset looks the same every time. */
function mulberry32(seed: number) {
  let state = seed;
  return function random() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Spreads dates across ~4 years so "forgotten" thresholds (1yr/2yr/3yr) all have real data. */
function pickDaysAgo(rng: () => number): number {
  const bucket = rng();
  if (bucket < 0.15) return 365 * 3 + Math.floor(rng() * 400); // 3-4+ years old
  if (bucket < 0.35) return Math.floor(365 * 1.5) + Math.floor(rng() * 365); // 1.5-2.5 years
  if (bucket < 0.7) return 90 + Math.floor(rng() * 275); // 3 months - 1 year
  if (bucket < 0.9) return 14 + Math.floor(rng() * 76); // 2 weeks - 3 months
  return Math.floor(rng() * 14); // added this month
}

/**
 * ~100 realistic bookmarks with genuine variety: duplicates, missing tags,
 * messy folders, old and recent dates, favorites, and read-later items —
 * enough for every dashboard feature to have something to show. Tags come
 * back as display names; resolve them with `resolveBookmarkTagNames`
 * before persisting, same as a real import.
 */
export function generateDemoBookmarks(seed = 20260101, now: number = Date.now()): Bookmark[] {
  const rng = mulberry32(seed);
  const categories = buildDefaultCategories();

  const bookmarks: Bookmark[] = DEMO_ENTRIES.map(([title, url, folder]) => {
    const domain = extractDomain(url);
    const classification = classifyBookmark({ title, url, domain, folder }, categories);
    const dateAdded = now - pickDaysAgo(rng) * DAY_MS;
    const untagged = rng() < 0.3;
    const favorite = rng() < 0.15;
    const readLater = rng() < 0.12;
    const archived = !favorite && rng() < 0.05;
    const hasNote = rng() < 0.1;

    return {
      id: createId(),
      url,
      normalizedUrl: normalizeUrl(url),
      title,
      domain,
      folder,
      categories: classification.categoryIds,
      tags: untagged ? [] : classification.suggestedTags.slice(0, 3),
      notes: hasNote ? DEMO_NOTES[Math.floor(rng() * DEMO_NOTES.length)] : undefined,
      favorite,
      archived,
      readLater,
      dateAdded,
      importedAt: now,
      lastModified: dateAdded,
      source: 'demo' as const,
    };
  });

  for (const target of DEMO_DUPLICATE_TARGETS) {
    const original = bookmarks.find((b) => b.url.includes(target));
    if (!original) continue;
    const variantUrl = original.url.endsWith('/') ? original.url.slice(0, -1) : `${original.url}/`;
    const dateAdded = now - pickDaysAgo(rng) * DAY_MS;
    bookmarks.push({
      ...original,
      id: createId(),
      url: variantUrl,
      normalizedUrl: normalizeUrl(variantUrl),
      dateAdded,
      lastModified: dateAdded,
      favorite: false,
      readLater: false,
      archived: false,
      notes: undefined,
    });
  }

  return bookmarks;
}
