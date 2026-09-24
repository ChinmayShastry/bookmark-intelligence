import Papa from 'papaparse';
import type { Bookmark, Category, Tag } from '../db/types';

function namesOf(ids: string[], byId: Map<string, string>): string[] {
  return ids.map((id) => byId.get(id) ?? id);
}

export function bookmarksToPortableRows(bookmarks: Bookmark[], categories: Category[], tags: Tag[]) {
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));
  const tagName = new Map(tags.map((t) => [t.id, t.name]));
  return bookmarks.map((b) => ({
    title: b.title,
    url: b.url,
    domain: b.domain,
    folder: b.folder ?? '',
    categories: namesOf(b.categories, categoryName),
    tags: namesOf(b.tags, tagName),
    notes: b.notes ?? '',
    favorite: b.favorite,
    archived: b.archived,
    readLater: b.readLater,
    dateAdded: b.dateAdded ?? null,
  }));
}

export function bookmarksToJson(bookmarks: Bookmark[], categories: Category[], tags: Tag[]): string {
  return JSON.stringify(bookmarksToPortableRows(bookmarks, categories, tags), null, 2);
}

export function bookmarksToCsv(bookmarks: Bookmark[], categories: Category[], tags: Tag[]): string {
  const rows = bookmarksToPortableRows(bookmarks, categories, tags).map((row) => ({
    ...row,
    categories: row.categories.join('; '),
    tags: row.tags.join('; '),
    dateAdded: row.dateAdded ? new Date(row.dateAdded).toISOString() : '',
  }));
  return Papa.unparse(rows);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Regenerates a standard Netscape bookmark HTML file any browser can import. */
export function bookmarksToNetscapeHtml(bookmarks: Bookmark[]): string {
  const byFolder = new Map<string, Bookmark[]>();
  for (const bookmark of bookmarks) {
    const key = bookmark.folder ?? '';
    const list = byFolder.get(key) ?? [];
    list.push(bookmark);
    byFolder.set(key, list);
  }

  const lines: string[] = [
    '<!DOCTYPE NETSCAPE-Bookmark-file-1>',
    '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
    '<TITLE>Bookmarks</TITLE>',
    '<H1>Bookmarks</H1>',
    '<DL><p>',
  ];

  const rootItems = byFolder.get('') ?? [];
  for (const bookmark of rootItems) {
    lines.push(bookmarkLine(bookmark));
  }

  for (const [folder, items] of byFolder) {
    if (!folder) continue;
    const addDate = Math.floor((items[0]?.dateAdded ?? Date.now()) / 1000);
    lines.push(`    <DT><H3 ADD_DATE="${addDate}">${escapeHtml(folder)}</H3>`);
    lines.push('    <DL><p>');
    for (const bookmark of items) {
      lines.push(bookmarkLine(bookmark));
    }
    lines.push('    </DL><p>');
  }

  lines.push('</DL><p>');
  return lines.join('\n');
}

function bookmarkLine(bookmark: Bookmark): string {
  const addDate = bookmark.dateAdded ? Math.floor(bookmark.dateAdded / 1000) : Math.floor(bookmark.importedAt / 1000);
  return `        <DT><A HREF="${escapeHtml(bookmark.url)}" ADD_DATE="${addDate}">${escapeHtml(bookmark.title || bookmark.url)}</A>`;
}
