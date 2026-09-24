export type LinkCheckResult = 'unreachable' | 'unknown';

/**
 * Best-effort, optional, user-triggered reachability check. Browsers block
 * reading the real response of a cross-origin request unless the target
 * sends CORS headers (most sites don't), so a `no-cors` fetch can only ever
 * tell us the network request itself failed outright (DNS, connection
 * refused, offline) — never that a page "is dead" or "is fine". We are
 * deliberately conservative: a request that resolves at all is reported as
 * "unknown", not "alive", and nothing here is ever labeled "dead".
 */
export async function checkLinkReachability(url: string, timeoutMs = 6000): Promise<LinkCheckResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    await fetch(url, { mode: 'no-cors', method: 'GET', signal: controller.signal, cache: 'no-store' });
    return 'unknown';
  } catch {
    return 'unreachable';
  } finally {
    clearTimeout(timeout);
  }
}
