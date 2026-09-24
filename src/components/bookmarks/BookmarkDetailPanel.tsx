import { useEffect, useMemo, useState } from 'react';
import { X, Copy, Star, Archive, ArchiveRestore, Trash2, BookOpenCheck, Plus, Sparkles } from 'lucide-react';
import { useAppState, useAppStore } from '../../lib/store/hooks';
import { classifyBookmark } from '../../lib/classifier';
import { SafeExternalLink } from '../common/SafeExternalLink';
import { Favicon } from '../common/Favicon';
import type { Bookmark } from '../../lib/db/types';

interface BookmarkDetailPanelProps {
  bookmark: Bookmark | null;
  onClose: () => void;
}

export function BookmarkDetailPanel({ bookmark, onClose }: BookmarkDetailPanelProps) {
  const store = useAppStore();
  const categories = useAppState((s) => s.categories);
  const tags = useAppState((s) => s.tags);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [tagDraft, setTagDraft] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setTitle(bookmark?.title ?? '');
    setNotes(bookmark?.notes ?? '');
    setTagDraft('');
    setCopied(false);
  }, [bookmark?.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const suggestions = useMemo(() => {
    if (!bookmark) return [];
    const result = classifyBookmark(
      { title: bookmark.title, url: bookmark.url, domain: bookmark.domain, folder: bookmark.folder },
      categories
    );
    const existingTagNames = new Set(
      bookmark.tags.map((id) => tags.find((t) => t.id === id)?.name.toLowerCase()).filter(Boolean)
    );
    return result.suggestedTags.filter((name) => !existingTagNames.has(name.toLowerCase()));
  }, [bookmark, categories, tags]);

  if (!bookmark) return null;

  const commitTitle = () => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== bookmark.title) void store.updateBookmark(bookmark.id, { title: trimmed });
  };
  const commitNotes = () => {
    if (notes !== (bookmark.notes ?? '')) void store.updateBookmark(bookmark.id, { notes });
  };
  const addTag = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const [id] = await store.ensureTags([trimmed]);
    if (id && !bookmark.tags.includes(id)) {
      void store.updateBookmark(bookmark.id, { tags: [...bookmark.tags, id] });
    }
    setTagDraft('');
  };
  const removeTag = (id: string) => void store.updateBookmark(bookmark.id, { tags: bookmark.tags.filter((t) => t !== id) });
  const toggleCategory = (id: string) => {
    const has = bookmark.categories.includes(id);
    void store.updateBookmark(bookmark.id, {
      categories: has ? bookmark.categories.filter((c) => c !== id) : [...bookmark.categories, id],
    });
  };
  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(bookmark.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable — nothing more we can do silently.
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink-950/30 lg:hidden" onClick={onClose} role="presentation" />
      <aside
        role="dialog"
        aria-label="Bookmark details"
        className="fixed inset-y-0 right-0 z-40 flex w-full max-w-sm flex-col border-l border-ink-200 bg-white shadow-2xl animate-slide-up dark:border-ink-800 dark:bg-ink-950"
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3 dark:border-ink-800">
          <div className="flex items-center gap-2">
            <Favicon icon={bookmark.icon} size={18} />
            <span className="text-xs font-medium uppercase tracking-wide text-ink-400">Bookmark</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitTitle}
            aria-label="Bookmark title"
            className="w-full rounded-md border border-transparent bg-transparent text-lg font-semibold text-ink-900 focus:border-ink-200 focus:bg-white focus:px-2 focus:py-1 focus:outline-none dark:text-white dark:focus:border-ink-700 dark:focus:bg-ink-900"
          />
          <p className="mt-0.5 text-sm text-ink-500 dark:text-ink-400">{bookmark.domain}</p>
          <p className="mt-2 break-all rounded-md bg-ink-50 px-2 py-1.5 text-xs text-ink-500 dark:bg-ink-900 dark:text-ink-400">
            {bookmark.url}
          </p>

          <div className="mt-3 flex gap-2">
            <SafeExternalLink
              url={bookmark.url}
              className="flex-1 rounded-lg bg-brand-600 py-2 text-center text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Open bookmark
            </SafeExternalLink>
            <button
              type="button"
              onClick={copyUrl}
              className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 dark:border-ink-700 dark:text-ink-200"
            >
              <Copy size={14} aria-hidden="true" />
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <ToggleButton
              active={bookmark.favorite}
              label="Favorite"
              icon={<Star size={14} fill={bookmark.favorite ? 'currentColor' : 'none'} />}
              onClick={() => store.updateBookmark(bookmark.id, { favorite: !bookmark.favorite })}
            />
            <ToggleButton
              active={bookmark.readLater}
              label="Read later"
              icon={<BookOpenCheck size={14} />}
              onClick={() => store.updateBookmark(bookmark.id, { readLater: !bookmark.readLater })}
            />
            <ToggleButton
              active={bookmark.archived}
              label="Archived"
              icon={bookmark.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
              onClick={() => store.updateBookmark(bookmark.id, { archived: !bookmark.archived })}
            />
          </div>

          <Section title="Category">
            <div className="flex flex-wrap gap-1.5">
              {categories.map((category) => {
                const active = bookmark.categories.includes(category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                      active
                        ? 'border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-500/40 dark:bg-brand-500/15 dark:text-brand-300'
                        : 'border-ink-200 text-ink-500 hover:border-ink-300 dark:border-ink-700 dark:text-ink-400'
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="Tags">
            <div className="flex flex-wrap items-center gap-1.5">
              {bookmark.tags.map((id) => {
                const tag = tags.find((t) => t.id === id);
                if (!tag) return null;
                return (
                  <span
                    key={id}
                    className="flex items-center gap-1 rounded-full bg-ink-100 px-2.5 py-1 text-xs text-ink-700 dark:bg-ink-800 dark:text-ink-200"
                  >
                    #{tag.name}
                    <button type="button" onClick={() => removeTag(id)} aria-label={`Remove tag ${tag.name}`}>
                      <X size={11} />
                    </button>
                  </span>
                );
              })}
              <input
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    void addTag(tagDraft);
                  }
                }}
                placeholder="Add tag…"
                aria-label="Add tag"
                className="w-24 rounded-full border border-dashed border-ink-300 bg-transparent px-2.5 py-1 text-xs text-ink-600 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none dark:border-ink-700 dark:text-ink-200"
              />
            </div>
            {suggestions.length > 0 && (
              <div className="mt-2">
                <p className="flex items-center gap-1 text-[11px] font-medium text-ink-400">
                  <Sparkles size={11} aria-hidden="true" /> Suggested
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {suggestions.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => addTag(name)}
                      className="flex items-center gap-1 rounded-full border border-dashed border-ink-300 px-2.5 py-1 text-xs text-ink-500 hover:border-brand-300 hover:text-brand-600 dark:border-ink-700 dark:text-ink-400"
                    >
                      <Plus size={11} aria-hidden="true" />
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {bookmark.folder && (
            <Section title="Original folder">
              <p className="text-sm text-ink-600 dark:text-ink-300">{bookmark.folder}</p>
            </Section>
          )}

          <Section title="Added">
            <p className="text-sm text-ink-600 dark:text-ink-300">
              {bookmark.dateAdded
                ? new Date(bookmark.dateAdded).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Unknown'}
            </p>
          </Section>

          <Section title="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={commitNotes}
              placeholder="Add a note…"
              rows={4}
              className="w-full resize-none rounded-lg border border-ink-200 bg-white p-2.5 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100"
            />
          </Section>

          <button
            type="button"
            onClick={() => {
              void store.deleteBookmarks([bookmark.id]);
              onClose();
            }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/20"
          >
            <Trash2 size={14} aria-hidden="true" />
            Delete bookmark
          </button>
        </div>
      </aside>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 border-t border-ink-100 pt-4 dark:border-ink-800">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">{title}</p>
      {children}
    </div>
  );
}

function ToggleButton({ active, label, icon, onClick }: { active: boolean; label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
        active
          ? 'border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-500/40 dark:bg-brand-500/15 dark:text-brand-300'
          : 'border-ink-200 text-ink-500 dark:border-ink-700 dark:text-ink-400'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
