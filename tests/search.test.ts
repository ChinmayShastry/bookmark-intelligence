import { describe, expect, it } from 'vitest';
import { parseSearchQuery } from '../src/lib/search/queryParser';
import { searchBookmarks } from '../src/lib/search';
import { buildDefaultCategories } from '../src/lib/classifier/defaultCategories';
import { normalizeUrl } from '../src/lib/normalization/url';
import type { Bookmark, Tag } from '../src/lib/db/types';

const categories = buildDefaultCategories();

function makeBookmark(overrides: Partial<Bookmark>): Bookmark {
  const now = Date.now();
  return {
    id: overrides.id ?? Math.random().toString(36),
    url: 'https://example.com',
    normalizedUrl: normalizeUrl('https://example.com'),
    title: 'Example',
    domain: 'example.com',
    categories: [],
    tags: [],
    favorite: false,
    archived: false,
    readLater: false,
    importedAt: now,
    lastModified: now,
    source: 'demo',
    ...overrides,
  };
}

describe('parseSearchQuery', () => {
  it('parses operator syntax', () => {
    const result = parseSearchQuery('tag:ai domain:github.com favorite:true', { categories: [], domains: [] });
    expect(result.filters.tag).toEqual(['ai']);
    expect(result.filters.domain).toEqual(['github.com']);
    expect(result.filters.favorite).toBe(true);
    expect(result.freeText).toBe('');
  });

  it('parses date operators', () => {
    const result = parseSearchQuery('before:2024-01-01 after:2023-01-01', { categories: [], domains: [] });
    expect(result.filters.before).toBe(Date.parse('2024-01-01'));
    expect(result.filters.after).toBe(Date.parse('2023-01-01'));
  });

  it('recognizes smart keywords', () => {
    expect(parseSearchQuery('duplicates', { categories: [], domains: [] }).filters.duplicate).toBe(true);
    expect(parseSearchQuery('untagged', { categories: [], domains: [] }).filters.untagged).toBe(true);
    expect(parseSearchQuery('favorites', { categories: [], domains: [] }).filters.favorite).toBe(true);
    expect(parseSearchQuery('recent', { categories: [], domains: [] }).recent).toBe(true);
    expect(parseSearchQuery('old', { categories: [], domains: [] }).old).toBe(true);
  });

  it('promotes a bare domain word to a hard filter', () => {
    const result = parseSearchQuery('youtube', { categories: [], domains: ['youtube.com', 'github.com'] });
    expect(result.filters.domain).toEqual(['youtube.com']);
    expect(result.freeText).toBe('');
  });

  it('combines a category word and a domain word', () => {
    const result = parseSearchQuery('AI github', { categories, domains: ['github.com'] });
    expect(result.filters.category).toContain('ai-ml');
    expect(result.filters.domain).toEqual(['github.com']);
  });

  it('leaves unmatched words as free text', () => {
    const result = parseSearchQuery('lang chain', { categories: [], domains: [] });
    expect(result.freeText).toBe('lang chain');
  });
});

describe('searchBookmarks', () => {
  const tags: Tag[] = [{ id: 'ai', name: 'AI', createdAt: 0 }];
  const bookmarks: Bookmark[] = [
    makeBookmark({
      id: '1',
      url: 'https://python.langchain.com/docs',
      normalizedUrl: normalizeUrl('https://python.langchain.com/docs'),
      title: 'LangChain Documentation',
      domain: 'python.langchain.com',
      tags: ['ai'],
    }),
    makeBookmark({
      id: '2',
      url: 'https://recipes.example.com/pasta',
      normalizedUrl: normalizeUrl('https://recipes.example.com/pasta'),
      title: 'Random Recipe',
      domain: 'recipes.example.com',
      favorite: true,
    }),
    makeBookmark({ id: '3', url: 'https://dup.com', normalizedUrl: normalizeUrl('https://dup.com'), title: 'Dup A' }),
    makeBookmark({ id: '4', url: 'https://dup.com/', normalizedUrl: normalizeUrl('https://dup.com/'), title: 'Dup B' }),
  ];

  const ctx = { bookmarks, categories, tags, fuzzySensitivity: 0.35, forgottenThresholdDays: 365 };

  it('fuzzy matches across word order', () => {
    const results = searchBookmarks('lang chain', ctx);
    expect(results.some((b) => b.id === '1')).toBe(true);
  });

  it('filters by favorite:true', () => {
    const results = searchBookmarks('favorite:true', ctx);
    expect(results.map((b) => b.id)).toEqual(['2']);
  });

  it('filters by duplicate:true', () => {
    const results = searchBookmarks('duplicates', ctx);
    expect(results.map((b) => b.id).sort()).toEqual(['3', '4']);
  });

  it('filters by tag name', () => {
    const results = searchBookmarks('tag:ai', ctx);
    expect(results.map((b) => b.id)).toEqual(['1']);
  });
});
