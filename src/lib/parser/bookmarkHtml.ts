import { decodeHtmlEntities } from '../utils/html-entities';

export interface ParsedBookmark {
  title: string;
  url: string;
  folder?: string;
  dateAdded?: number;
  tags: string[];
  icon?: string;
}

export interface ParseResult {
  bookmarks: ParsedBookmark[];
  folders: string[];
  emptyFolders: string[];
}

export class InvalidBookmarkFileError extends Error {
  constructor(message = "We couldn't recognize this file as a browser bookmark export.") {
    super(message);
    this.name = 'InvalidBookmarkFileError';
  }
}

/**
 * Browser bookmark exports (Chrome, Edge, Brave, Firefox, and Safari's
 * HTML export) all use the same "Netscape Bookmark File" format: a loosely
 * structured, often-invalid HTML document where folders are <H3> headings
 * followed by a nested <DL> list, and links are <A> tags. This is a
 * hand-written tokenizer rather than a DOMParser pass so it behaves
 * identically on the main thread and inside a Web Worker (no `document`
 * available there), and so it tolerates the format's unclosed <DT>/<p> tags.
 */
export function looksLikeBookmarkExport(html: string): boolean {
  if (!html || html.length < 20) return false;
  const head = html.slice(0, 4000).toUpperCase();
  const hasDoctype = head.includes('NETSCAPE-BOOKMARK-FILE');
  const hasStructure = /<DL/i.test(html) && /<A\s/i.test(html) && /HREF\s*=/i.test(html);
  return hasDoctype || hasStructure;
}

interface Attributes {
  [key: string]: string;
}

function parseAttributes(raw: string): Attributes {
  const attrs: Attributes = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)')/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(raw))) {
    const key = match[1].toUpperCase();
    attrs[key] = match[3] !== undefined ? match[3] : (match[4] ?? '');
  }
  return attrs;
}

function parseTags(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((t) => decodeHtmlEntities(t).trim())
    .filter(Boolean);
}

function parseAddDate(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const seconds = Number.parseInt(raw, 10);
  if (!Number.isFinite(seconds) || seconds <= 0) return undefined;
  // Netscape format stores ADD_DATE in Unix seconds.
  return seconds * 1000;
}

const TOKEN_RE = /<DL[^>]*>|<\/DL\s*>|<H3([^>]*)>([\s\S]*?)<\/H3>|<A([^>]*)>([\s\S]*?)<\/A>/gi;

export function parseBookmarkHtml(html: string): ParseResult {
  if (!looksLikeBookmarkExport(html)) {
    throw new InvalidBookmarkFileError();
  }

  const bookmarks: ParsedBookmark[] = [];
  const allFolderPaths = new Set<string>();
  const nonEmptyFolderPaths = new Set<string>();

  const pathStack: string[] = [];
  const dlBoundaries: number[] = [];
  let pendingFolderName: string | null = null;

  TOKEN_RE.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TOKEN_RE.exec(html))) {
    const full = match[0];

    if (match[1] !== undefined) {
      // <H3 ...>Folder Name</H3>
      pendingFolderName = decodeHtmlEntities(match[2]).trim() || 'Untitled Folder';
      continue;
    }

    if (match[3] !== undefined) {
      // <A ...>Title</A>
      const attrs = parseAttributes(match[3]);
      const href = attrs.HREF;
      if (!href) continue;
      const title = decodeHtmlEntities(match[4]).trim();
      const folder = pathStack.length ? pathStack.join(' / ') : undefined;
      if (folder) nonEmptyFolderPaths.add(folder);
      bookmarks.push({
        title,
        url: href,
        folder,
        dateAdded: parseAddDate(attrs.ADD_DATE),
        tags: parseTags(attrs.TAGS),
        icon: attrs.ICON && attrs.ICON.startsWith('data:') ? attrs.ICON : undefined,
      });
      continue;
    }

    if (/^<\/DL/i.test(full)) {
      const boundary = dlBoundaries.pop();
      pathStack.length = boundary ?? 0;
      continue;
    }

    // <DL ...> — opens a new scope. Belongs to the most recent <H3>, if any.
    dlBoundaries.push(pathStack.length);
    if (pendingFolderName !== null) {
      pathStack.push(pendingFolderName);
      allFolderPaths.add(pathStack.join(' / '));
      pendingFolderName = null;
    }
  }

  const emptyFolders = [...allFolderPaths].filter((path) => {
    if (nonEmptyFolderPaths.has(path)) return false;
    for (const nonEmpty of nonEmptyFolderPaths) {
      if (nonEmpty.startsWith(path + ' / ')) return false;
    }
    return true;
  });

  return {
    bookmarks,
    folders: [...allFolderPaths],
    emptyFolders,
  };
}
