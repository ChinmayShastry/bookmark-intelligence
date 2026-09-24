import { useMemo } from 'react';
import { History, ExternalLink, Archive, Trash2, ThumbsUp } from 'lucide-react';
import { useAppState, useAppStore } from '../../lib/store/hooks';
import { getForgottenBookmarks } from '../../lib/selectors/stats';
import { SafeExternalLink } from '../common/SafeExternalLink';
import { Favicon } from '../common/Favicon';

const THRESHOLD_OPTIONS = [
  { label: '6 months', days: 182 },
  { label: '1 year', days: 365 },
  { label: '2 years', days: 730 },
  { label: '3 years', days: 1095 },
];

function timeAgo(timestamp: number): string {
  const days = Math.floor((Date.now() - timestamp) / (24 * 60 * 60 * 1000));
  if (days < 60) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 24) return `${months} month${months === 1 ? '' : 's'} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

export function ForgottenView() {
  const bookmarks = useAppState((s) => s.bookmarks);
  const settings = useAppState((s) => s.settings);
  const store = useAppStore();

  const forgotten = useMemo(
    () => getForgottenBookmarks(bookmarks, settings.forgottenThresholdDays),
    [bookmarks, settings.forgottenThresholdDays]
  );

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-4 md:p-6">
      <h1 className="text-lg font-semibold text-ink-900 dark:text-white">Rediscover your bookmarks</h1>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
        You have {forgotten.length.toLocaleString()} bookmark{forgotten.length === 1 ? '' : 's'} older than{' '}
        {settings.forgottenThresholdDays} days that you haven't touched.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {THRESHOLD_OPTIONS.map((opt) => (
          <button
            key={opt.days}
            type="button"
            onClick={() => store.updateSettings({ forgottenThresholdDays: opt.days })}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
              settings.forgottenThresholdDays === opt.days
                ? 'border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-500/40 dark:bg-brand-500/15 dark:text-brand-300'
                : 'border-ink-200 text-ink-500 dark:border-ink-700 dark:text-ink-400'
            }`}
          >
            Older than {opt.label}
          </button>
        ))}
      </div>

      {forgotten.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-2 text-center">
          <History size={26} className="text-ink-300 dark:text-ink-700" aria-hidden="true" />
          <p className="text-sm text-ink-500 dark:text-ink-400">Nothing forgotten right now — nice.</p>
        </div>
      ) : (
        <ul className="mt-5 space-y-2">
          {forgotten.map((bookmark) => {
            const effective = bookmark.dateAdded ?? bookmark.importedAt;
            return (
              <li
                key={bookmark.id}
                className="flex flex-col gap-2 rounded-xl border border-ink-100 p-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-ink-800"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Favicon icon={bookmark.icon} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900 dark:text-white">
                      {bookmark.title || bookmark.url}
                    </p>
                    <p className="text-xs text-ink-400">You saved this {timeAgo(effective)}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <SafeExternalLink
                    url={bookmark.url}
                    className="flex items-center gap-1 rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-medium text-ink-600 dark:border-ink-700 dark:text-ink-300"
                  >
                    <ExternalLink size={12} aria-hidden="true" />
                    Open
                  </SafeExternalLink>
                  <button
                    type="button"
                    onClick={() => store.updateBookmark(bookmark.id, { lastReviewedAt: Date.now() })}
                    className="flex items-center gap-1 rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-medium text-ink-600 dark:border-ink-700 dark:text-ink-300"
                  >
                    <ThumbsUp size={12} aria-hidden="true" />
                    Still useful
                  </button>
                  <button
                    type="button"
                    onClick={() => store.updateBookmark(bookmark.id, { archived: true })}
                    className="flex items-center gap-1 rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-medium text-ink-600 dark:border-ink-700 dark:text-ink-300"
                  >
                    <Archive size={12} aria-hidden="true" />
                    Archive
                  </button>
                  <button
                    type="button"
                    onClick={() => store.deleteBookmarks([bookmark.id])}
                    className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:border-red-900/40 dark:text-red-400"
                  >
                    <Trash2 size={12} aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
