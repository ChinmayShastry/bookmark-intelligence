import { describe, expect, it } from 'vitest';
import { countExtraDuplicates, findDuplicateGroups } from '../src/lib/duplicates';

describe('findDuplicateGroups', () => {
  it('groups bookmarks that normalize to the same URL', () => {
    const items = [
      { url: 'https://example.com/page' },
      { url: 'https://example.com/page/' },
      { url: 'https://example.com/page?utm_source=x' },
      { url: 'https://example.com/other' },
    ];
    const groups = findDuplicateGroups(items);
    expect(groups).toHaveLength(1);
    expect(groups[0].items).toHaveLength(3);
  });

  it('does not group materially different query strings', () => {
    const items = [{ url: 'https://example.com/search?q=a' }, { url: 'https://example.com/search?q=b' }];
    expect(findDuplicateGroups(items)).toHaveLength(0);
  });

  it('counts extra copies, not group size', () => {
    const items = [
      { url: 'https://a.com' },
      { url: 'https://a.com/' },
      { url: 'https://a.com/' },
      { url: 'https://b.com' },
    ];
    expect(countExtraDuplicates(items)).toBe(2);
  });
});
