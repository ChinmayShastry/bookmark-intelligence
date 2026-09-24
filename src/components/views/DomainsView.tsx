import { useMemo } from 'react';
import { useAppState } from '../../lib/store/hooks';
import { getDomainCounts } from '../../lib/selectors/stats';

interface DomainsViewProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

export function DomainsView({ onNavigate }: DomainsViewProps) {
  const bookmarks = useAppState((s) => s.bookmarks);
  const categories = useAppState((s) => s.categories);
  const domains = useMemo(() => getDomainCounts(bookmarks, categories), [bookmarks, categories]);
  const maxCount = domains[0]?.count ?? 1;

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-4 md:p-6">
      <h1 className="text-lg font-semibold text-ink-900 dark:text-white">Domains</h1>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
        {domains.length} distinct domain{domains.length === 1 ? '' : 's'}. Click one to see its bookmarks.
      </p>

      <div className="mt-5 space-y-1">
        {domains.map((d) => (
          <button
            key={d.domain}
            type="button"
            onClick={() => onNavigate('search', { q: `domain:${d.domain}` })}
            className="flex w-full items-center gap-4 rounded-lg px-3 py-2.5 text-left transition hover:bg-ink-50 dark:hover:bg-ink-900/60"
          >
            <span className="w-40 shrink-0 truncate text-sm font-medium text-ink-800 dark:text-ink-100">{d.domain}</span>
            <div className="h-1.5 flex-1 rounded-full bg-ink-100 dark:bg-ink-800">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${(d.count / maxCount) * 100}%` }} />
            </div>
            <span className="w-14 shrink-0 text-right text-sm text-ink-500 dark:text-ink-400">{d.count.toLocaleString()}</span>
            <span className="w-12 shrink-0 text-right text-xs text-ink-400">{d.percentage}%</span>
            <span className="hidden w-40 shrink-0 truncate text-xs text-ink-400 sm:block">{d.topCategories.join(', ')}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
