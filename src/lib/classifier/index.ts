import type { Category } from '../db/types';
import { CONTENT_TYPE_KEYWORD_MAP, TAG_KEYWORD_MAP } from './tagKeywords';

export interface ClassificationInput {
  title: string;
  url: string;
  domain: string;
  folder?: string;
}

export interface ClassificationResult {
  categoryIds: string[];
  suggestedTags: string[];
}

function normalizeForMatch(text: string): string {
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
  return ` ${cleaned} `;
}

function keywordMatches(normalizedHaystack: string, keyword: string): boolean {
  const normalizedKeyword = normalizeForMatch(keyword).trim();
  if (!normalizedKeyword) return false;
  // Whole-token match only (so "ai" never matches inside "mail"), but
  // tolerate a simple trailing plural ("agent" also matches "agents").
  return (
    normalizedHaystack.includes(` ${normalizedKeyword} `) ||
    normalizedHaystack.includes(` ${normalizedKeyword}s `)
  );
}

function domainMatches(domain: string, candidate: string): boolean {
  const d = domain.toLowerCase();
  const c = candidate.toLowerCase();
  return d === c || d.endsWith(`.${c}`);
}

function safePathAndQuery(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    return `${url.pathname} ${url.search}`;
  } catch {
    return '';
  }
}

/**
 * Deterministic, local classification — no network calls, no AI API.
 * Scores every configured category against the bookmark's domain, title,
 * folder name, and URL path, then returns the top matches plus a short
 * list of suggested tags drawn from a separate, more specific keyword map.
 */
export function classifyBookmark(input: ClassificationInput, categories: Category[]): ClassificationResult {
  const titleText = normalizeForMatch(input.title);
  const folderText = normalizeForMatch(input.folder ?? '');
  const pathText = normalizeForMatch(safePathAndQuery(input.url));
  const combinedText = normalizeForMatch(
    `${input.title} ${input.folder ?? ''} ${safePathAndQuery(input.url)}`
  );

  const scored = categories
    .filter((category) => category.id !== 'other')
    .map((category) => {
      let score = 0;
      if (category.domains.some((d) => domainMatches(input.domain, d))) score += 4;
      for (const keyword of category.keywords) {
        if (keywordMatches(titleText, keyword)) score += 2;
        if (keywordMatches(folderText, keyword)) score += 2;
        if (keywordMatches(pathText, keyword)) score += 1;
      }
      return { id: category.id, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const categoryIds = scored.slice(0, 3).map((entry) => entry.id);
  if (categoryIds.length === 0) categoryIds.push('other');

  const suggestedTags = suggestTags(combinedText);

  return { categoryIds, suggestedTags };
}

function suggestTags(normalizedHaystack: string): string[] {
  const found: string[] = [];
  const seen = new Set<string>();

  const maps = [TAG_KEYWORD_MAP, CONTENT_TYPE_KEYWORD_MAP];
  for (const map of maps) {
    const entries = Object.entries(map).sort((a, b) => b[0].length - a[0].length);
    for (const [keyword, canonical] of entries) {
      if (seen.has(canonical)) continue;
      if (keywordMatches(normalizedHaystack, keyword)) {
        found.push(canonical);
        seen.add(canonical);
      }
      if (found.length >= 6) return found;
    }
  }
  return found;
}
