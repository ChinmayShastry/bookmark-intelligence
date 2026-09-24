import type { Category } from '../db/types';

export interface SearchFilters {
  tag?: string[];
  domain?: string[];
  category?: string[];
  folder?: string[];
  favorite?: boolean;
  duplicate?: boolean;
  archived?: boolean;
  readLater?: boolean;
  untagged?: boolean;
  hasNotes?: boolean;
  before?: number;
  after?: number;
}

export interface ParsedQuery {
  freeText: string;
  filters: SearchFilters;
  recent: boolean;
  old: boolean;
}

export interface QueryContext {
  categories: Category[];
  domains: string[];
}

// Matches, in order: key:"quoted value", key:value, "quoted phrase", bare word.
const TOKEN_RE = /([a-zA-Z_-]+):"([^"]*)"|([a-zA-Z_-]+):(\S+)|"([^"]*)"|(\S+)/g;

function parseBool(value: string): boolean {
  return value.toLowerCase() !== 'false' && value !== '0';
}

function normalizeWord(text: string): string {
  return ` ${text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()} `;
}

function categoryMatchesWord(category: Category, word: string): boolean {
  if (category.id === word) return true;
  return normalizeWord(category.name).includes(` ${word} `);
}

/**
 * Turns a query string into structured filters + leftover free text, per
 * the operators (`tag:`, `domain:`, `category:`, `favorite:`, `duplicate:`,
 * `before:`, `after:`, ...) and smart keywords (`duplicates`, `untagged`,
 * `favorites`, `recent`, `old`) documented in Settings > Search. Bare words
 * that exactly name a known category or domain become hard filters (so
 * "youtube" or "AI github" filter precisely) instead of only ranking by
 * fuzzy relevance.
 */
export function parseSearchQuery(raw: string, context: QueryContext): ParsedQuery {
  const filters: SearchFilters = {};
  const freeTextParts: string[] = [];
  let recent = false;
  let old = false;

  TOKEN_RE.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TOKEN_RE.exec(raw))) {
    const opKeyQuoted = match[1];
    const opValQuoted = match[2];
    const opKeyBare = match[3];
    const opValBare = match[4];
    const quotedPhrase = match[5];
    const bareWord = match[6];

    const key = (opKeyQuoted ?? opKeyBare)?.toLowerCase();
    const value = opValQuoted ?? opValBare;

    if (key !== undefined && value !== undefined) {
      switch (key) {
        case 'tag':
          (filters.tag ??= []).push(value.toLowerCase());
          break;
        case 'domain':
          (filters.domain ??= []).push(value.toLowerCase());
          break;
        case 'category':
          (filters.category ??= []).push(value.toLowerCase());
          break;
        case 'folder':
          (filters.folder ??= []).push(value.toLowerCase());
          break;
        case 'favorite':
          filters.favorite = parseBool(value);
          break;
        case 'duplicate':
        case 'duplicates':
          filters.duplicate = parseBool(value);
          break;
        case 'archived':
          filters.archived = parseBool(value);
          break;
        case 'readlater':
        case 'read-later':
        case 'read_later':
          filters.readLater = parseBool(value);
          break;
        case 'notes':
        case 'has-notes':
          filters.hasNotes = parseBool(value);
          break;
        case 'before': {
          const parsed = Date.parse(value);
          if (!Number.isNaN(parsed)) filters.before = parsed;
          break;
        }
        case 'after': {
          const parsed = Date.parse(value);
          if (!Number.isNaN(parsed)) filters.after = parsed;
          break;
        }
        default:
          freeTextParts.push(`${key}:${value}`);
      }
      continue;
    }

    if (quotedPhrase !== undefined) {
      freeTextParts.push(quotedPhrase);
      continue;
    }

    const word = bareWord ?? '';
    const lower = word.toLowerCase();

    switch (lower) {
      case 'duplicates':
      case 'duplicate':
        filters.duplicate = true;
        continue;
      case 'untagged':
        filters.untagged = true;
        continue;
      case 'favorites':
      case 'favorite':
        filters.favorite = true;
        continue;
      case 'archived':
        filters.archived = true;
        continue;
      case 'recent':
        recent = true;
        continue;
      case 'old':
        old = true;
        continue;
      default:
        break;
    }

    const categoryMatch = context.categories.find((c) => categoryMatchesWord(c, lower));
    const domainMatch = context.domains.find((d) => d === lower || d.includes(lower));
    let matchedAsFilter = false;
    if (categoryMatch) {
      (filters.category ??= []).push(categoryMatch.id);
      matchedAsFilter = true;
    }
    if (domainMatch && lower.length >= 3) {
      (filters.domain ??= []).push(domainMatch);
      matchedAsFilter = true;
    }
    if (!matchedAsFilter) {
      freeTextParts.push(word);
    }
  }

  return { freeText: freeTextParts.join(' ').trim(), filters, recent, old };
}
