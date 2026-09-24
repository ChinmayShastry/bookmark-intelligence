import { describe, expect, it } from 'vitest';
import { InvalidBookmarkFileError, looksLikeBookmarkExport, parseBookmarkHtml } from '../src/lib/parser/bookmarkHtml';

const SAMPLE_HTML = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="1690000000">Bookmarks bar</H3>
    <DL><p>
        <DT><A HREF="https://github.com/langchain-ai/langchain" ADD_DATE="1690000001" TAGS="ai,python">LangChain Documentation</A>
        <DT><H3 ADD_DATE="1690000002">Programming</H3>
        <DL><p>
            <DT><A HREF="https://stackoverflow.com/questions/1" ADD_DATE="1690000003">How to center a div</A>
            <DT><A HREF="https://stackoverflow.com/questions/1?utm_source=digest" ADD_DATE="1690000004">Centering a div (dup)</A>
        </DL><p>
        <DT><H3 ADD_DATE="1690000005">Empty Folder</H3>
        <DL><p>
        </DL><p>
        <DT><A HREF="https://example.com/untitled" ADD_DATE="1690000006"></A>
    </DL><p>
</DL><p>
`;

describe('looksLikeBookmarkExport', () => {
  it('accepts a Netscape bookmark file', () => {
    expect(looksLikeBookmarkExport(SAMPLE_HTML)).toBe(true);
  });

  it('rejects an arbitrary HTML page', () => {
    expect(looksLikeBookmarkExport('<html><body><h1>Not bookmarks</h1></body></html>')).toBe(false);
  });

  it('rejects empty input', () => {
    expect(looksLikeBookmarkExport('')).toBe(false);
  });
});

describe('parseBookmarkHtml', () => {
  it('throws a friendly error for non-bookmark files', () => {
    expect(() => parseBookmarkHtml('<html>hello</html>')).toThrow(InvalidBookmarkFileError);
  });

  it('extracts all bookmarks with their folder path', () => {
    const result = parseBookmarkHtml(SAMPLE_HTML);
    expect(result.bookmarks).toHaveLength(4);

    const langchain = result.bookmarks.find((b) => b.url.includes('langchain'));
    expect(langchain?.title).toBe('LangChain Documentation');
    expect(langchain?.folder).toBe('Bookmarks bar');
    expect(langchain?.tags).toEqual(['ai', 'python']);
    expect(langchain?.dateAdded).toBe(1690000001 * 1000);

    const stackoverflow = result.bookmarks.filter((b) => b.url.includes('stackoverflow'));
    expect(stackoverflow).toHaveLength(2);
    expect(stackoverflow[0].folder).toBe('Bookmarks bar / Programming');
  });

  it('captures an untitled bookmark as an empty title', () => {
    const result = parseBookmarkHtml(SAMPLE_HTML);
    const untitled = result.bookmarks.find((b) => b.url.includes('untitled'));
    expect(untitled?.title).toBe('');
  });

  it('detects empty folders without flagging ancestors that have descendants', () => {
    const result = parseBookmarkHtml(SAMPLE_HTML);
    expect(result.emptyFolders).toEqual(['Bookmarks bar / Empty Folder']);
    expect(result.folders).toEqual(
      expect.arrayContaining(['Bookmarks bar', 'Bookmarks bar / Programming', 'Bookmarks bar / Empty Folder'])
    );
  });

  it('decodes HTML entities in titles', () => {
    const html = SAMPLE_HTML.replace('LangChain Documentation', 'Tom &amp; Jerry &#39;Guide&#39;');
    const result = parseBookmarkHtml(html);
    const entry = result.bookmarks.find((b) => b.url.includes('langchain'));
    expect(entry?.title).toBe("Tom & Jerry 'Guide'");
  });
});
