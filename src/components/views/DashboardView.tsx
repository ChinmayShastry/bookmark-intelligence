import { useMemo } from 'react';
import { Bookmark as BookmarkIcon, FolderTree, Copy, Tag as TagIcon, Globe, CalendarPlus, ArrowRight } from 'lucide-react';
import { useAppState } from '../../lib/store/hooks';
import { getBasicStats, getCategoryCounts, getDomainCounts, computeHealthScore } from '../../lib/selectors/stats';
import { HealthScoreWidget } from '../insights/HealthScoreWidget';

interface DashboardViewProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const bookmarks = useAppState((s) => s.bookmarks);
  const categories = useAppState((s) => s.categories);
  const settings = useAppState((s) => s.settings);

  const stats = useMemo(() => getBasicStats(bookmarks), [bookmarks]);
  const categoryCounts = useMemo(() => getCategoryCounts(bookmarks, categories).slice(0, 5), [bookmarks, categories]);
  const domainCounts = useMemo(() => getDomainCounts(bookmarks, categories).slice(0, 5), [bookmarks, categories]);
  const health = useMemo(
    () => computeHealthScore(bookmarks, categories, settings.forgottenThresholdDays),
    [bookmarks, categories, settings.forgottenThresholdDays]
  );

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-4 md:p-6">
      <h1 className="text-2xl font-semibold text-ink-900 dark:text-white">
        {greeting()} {'\u{1F44B}'}
      </h1>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Your Bookmark Intelligence</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={BookmarkIcon} label="Total bookmarks" value={stats.total} onClick={() => onNavigate('bookmarks')} />
        <StatCard icon={FolderTree} label="Categories" value={stats.categories} onClick={() => onNavigate('categories')} />
        <StatCard icon={Copy} label="Duplicates" value={stats.duplicates} onClick={() => onNavigate('duplicates')} />
        <StatCard icon={TagIcon} label="Untagged" value={stats.untagged} onClick={() => onNavigate('tags')} />
        <StatCard icon={Globe} label="Domains" value={stats.domains} onClick={() => onNavigate('domains')} />
        <StatCard icon={CalendarPlus} label="Added this month" value={stats.addedThisMonth} onClick={() => onNavigate('bookmarks')} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-ink-100 p-4 dark:border-ink-800">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-900 dark:text-white">Bookmark Health</h2>
            <button
              type="button"
              onClick={() => onNavigate('insights')}
              className="flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400"
            >
              Details <ArrowRight size={12} aria-hidden="true" />
            </button>
          </div>
          <div className="mt-3">
            <HealthScoreWidget breakdown={health} compact />
          </div>
        </div>

        <div className="rounded-xl border border-ink-100 p-4 dark:border-ink-800">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-900 dark:text-white">Your biggest interests</h2>
            <button
              type="button"
              onClick={() => onNavigate('insights')}
              className="flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400"
            >
              View all <ArrowRight size={12} aria-hidden="true" />
            </button>
          </div>
          <ul className="mt-3 space-y-2">
            {categoryCounts.length === 0 && <EmptyRow />}
            {categoryCounts.map((c) => (
              <li key={c.categoryId}>
                <button
                  type="button"
                  onClick={() => onNavigate('bookmarks')}
                  className="flex w-full items-center justify-between text-left text-sm"
                >
                  <span className="text-ink-700 dark:text-ink-200">{c.name}</span>
                  <span className="text-ink-400">{c.percentage}%</span>
                </button>
                <div className="mt-1 h-1.5 rounded-full bg-ink-100 dark:bg-ink-800">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${c.percentage}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-ink-100 p-4 dark:border-ink-800">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-900 dark:text-white">Most bookmarked domains</h2>
            <button
              type="button"
              onClick={() => onNavigate('domains')}
              className="flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400"
            >
              View all <ArrowRight size={12} aria-hidden="true" />
            </button>
          </div>
          <ul className="mt-3 space-y-2.5">
            {domainCounts.length === 0 && <EmptyRow />}
            {domainCounts.map((d) => (
              <li key={d.domain} className="flex items-center justify-between text-sm">
                <span className="truncate text-ink-700 dark:text-ink-200">{d.domain}</span>
                <span className="shrink-0 text-ink-400">{d.count.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: typeof BookmarkIcon;
  label: string;
  value: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-ink-100 bg-white p-3.5 text-left transition hover:border-brand-200 hover:shadow-sm dark:border-ink-800 dark:bg-ink-900/60"
    >
      <Icon size={16} className="text-ink-400" aria-hidden="true" />
      <p className="mt-2 text-xl font-semibold text-ink-900 dark:text-white">{value.toLocaleString()}</p>
      <p className="text-xs text-ink-500 dark:text-ink-400">{label}</p>
    </button>
  );
}

function EmptyRow() {
  return <p className="text-xs text-ink-400">Nothing to show yet.</p>;
}
