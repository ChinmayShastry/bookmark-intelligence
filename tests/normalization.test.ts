import { describe, expect, it } from 'vitest';
import { extractDomain, isSafeUrl, normalizeUrl } from '../src/lib/normalization/url';

describe('normalizeUrl', () => {
  it('treats a trailing slash as equivalent', () => {
    expect(normalizeUrl('https://example.com')).toBe(normalizeUrl('https://example.com/'));
  });

  it('ignores hash fragments', () => {
    expect(normalizeUrl('https://example.com/page#section')).toBe(normalizeUrl('https://example.com/page'));
  });

  it('ignores protocol differences', () => {
    expect(normalizeUrl('http://example.com/page')).toBe(normalizeUrl('https://example.com/page'));
  });

  it('strips known tracking parameters', () => {
    const withTracking = 'https://example.com/article?utm_source=twitter&utm_medium=social&fbclid=abc123';
    expect(normalizeUrl(withTracking)).toBe(normalizeUrl('https://example.com/article'));
  });

  it('keeps materially different query parameters distinct', () => {
    expect(normalizeUrl('https://example.com/search?q=cats')).not.toBe(normalizeUrl('https://example.com/search?q=dogs'));
  });

  it('is stable regardless of query parameter order', () => {
    expect(normalizeUrl('https://example.com/?a=1&b=2')).toBe(normalizeUrl('https://example.com/?b=2&a=1'));
  });

  it('falls back gracefully for unparseable input', () => {
    expect(() => normalizeUrl('not a url')).not.toThrow();
  });
});

describe('extractDomain', () => {
  it('strips the www prefix', () => {
    expect(extractDomain('https://www.github.com/foo')).toBe('github.com');
  });

  it('lowercases the host', () => {
    expect(extractDomain('https://GitHub.com/foo')).toBe('github.com');
  });
});

describe('isSafeUrl', () => {
  it('allows http and https', () => {
    expect(isSafeUrl('https://example.com')).toBe(true);
    expect(isSafeUrl('http://example.com')).toBe(true);
  });

  it('blocks javascript: URLs', () => {
    expect(isSafeUrl('javascript:alert(1)')).toBe(false);
  });

  it('blocks data: and file: URLs', () => {
    expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isSafeUrl('file:///etc/passwd')).toBe(false);
  });
});
