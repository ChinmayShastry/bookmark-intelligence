/**
 * URL normalization for duplicate detection and domain grouping.
 *
 * The normalized key is used ONLY for comparison — the bookmark's original
 * `url` field is always preserved unchanged for opening/display. We are
 * deliberately conservative: only a small, well-known set of tracking
 * parameters is stripped, and every other query parameter is kept (and
 * sorted, so parameter order does not create false negatives).
 */

const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'utm_name',
  'utm_reader',
  'gclid',
  'gclsrc',
  'dclid',
  'fbclid',
  'msclkid',
  'mc_cid',
  'mc_eid',
  'igshid',
  'igsh',
  'yclid',
  '_hsenc',
  '_hsmi',
  'vero_id',
  'mkt_tok',
  'ref_src',
  'ref',
  'spm',
  'si',
  'feature',
]);

/**
 * Produces a stable comparison key for duplicate detection. Two bookmarks
 * with the same normalized URL are considered the same page. Protocol
 * (http vs https) and a trailing slash are ignored; everything else that
 * could change page content (path, non-tracking query params) is kept.
 */
export function normalizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  try {
    const url = new URL(trimmed);
    const host = url.hostname.toLowerCase();
    let pathname = url.pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }
    const params = new URLSearchParams(url.search);
    for (const key of [...params.keys()]) {
      if (TRACKING_PARAMS.has(key.toLowerCase())) {
        params.delete(key);
      }
    }
    const sortedEntries = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
    const query = sortedEntries.length ? '?' + sortedEntries.map(([k, v]) => `${k}=${v}`).join('&') : '';
    return `${host}${pathname}${query}`;
  } catch {
    return trimmed
      .toLowerCase()
      .replace(/#.*$/, '')
      .replace(/\/+$/, '');
  }
}

/** Bare hostname for display and domain grouping (no protocol, no "www."). */
export function extractDomain(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return 'unknown';
  }
}

/**
 * Only http(s) URLs may be opened or stored as clickable links. This blocks
 * `javascript:`, `data:`, `file:` and other schemes that could execute code
 * or leak local files if a malicious bookmark file were ever imported.
 */
export function isSafeUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isValidUrl(rawUrl: string): boolean {
  try {
    new URL(rawUrl);
    return true;
  } catch {
    return false;
  }
}
