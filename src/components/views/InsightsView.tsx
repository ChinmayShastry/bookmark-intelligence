import { useMemo } from 'react';
import { useAppState, useAppStore } from '../../lib/store/hooks';
import {
  computeHealthScore,
  getBasicStats,
  getCategoryCounts,
  getDomainCounts,
  getForgottenBookmarks,
  getMonthlyGrowth,
} from '../../lib/selectors/stats';
import { HealthScoreWidget } from '../insights/HealthScoreWidget';
import { GrowthChart } from '../insights/GrowthChart';

interface InsightsViewProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

const THRESHOLD_OPTIONS = [
  { label: '6 months', days: 182 },
  { label: '1 year', days: 365 },
  { label: '2 years', days: 730 },
  { label: '3 years', days: 1095 },
];

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-ink-100 p-4 dark:border-ink-800">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-900 dark:text-white">{title}</h2>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function InsightsView({ onNavigate }: InsightsViewProps) {
  const bookmarks = useAppState((s) => s.bookmarks);
  const categories = useAppState((s) => s.categories);
  const settings = useAppState((s) => s.settings);
  const store = useAppStore();

  const stats = useMemo(() => getBasicStats(bookmarks), [bookmarks]);
  const health = useMemo(
    () => computeHealthScore(bookmarks, categories, settings.forgottenThresholdDays),
    [bookmarks, categories, settings.forgottenThresholdDays]
  );
  const categoryCounts = useMemo(() => getCategoryCounts(bookmarks, categories), [bookmarks, categories]);
  const domainCounts = useMemo(() => getDomainCounts(bookmarks, categories).slice(0, 8), [bookmarks, categories]);
  const growth = useMemo(() => getMonthlyGrowth(bookmarks, 6), [bookmarks]);
  const forgotten = useMemo(
    () => getForgottenBookmarks(bookmarks, settings.forgottenThresholdDays),
    [bookmarks, settings.forgottenThresholdDays]
  );

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-4 md:p-6">
      <h1 className="text-lg font-semibold text-ink-900 dark:text-white">Bookmark Insights</h1>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
        {stats.total.toLocaleString()} bookmarks · {stats.domains.toLocaleString()} domains ·{' '}
        {stats.categories.toLocaleString()} categories in use
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Bookmark Health">
          <HealthScoreWidget breakdown={health} />
        </Card>
        <Card title="Your bookmark growth">
          <GrowthChart data={growth} />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Your biggest interests">
          <ul className="space-y-2.5">
            {categoryCounts.map((c) => (
              <li key={c.categoryId}>
                <button
                  type="button"
                  onClick={() => onNavigate('search', { q: `category:${c.categoryId}` })}
                  className="flex w-full items-center justify-between text-left text-sm"
                >
                  <span className="text-ink-700 dark:text-ink-200">{c.name}</span>
                  <span className="text-ink-400">
                    {c.count.toLocaleString()} · {c.percentage}%
                  </span>
                </button>
                <div className="mt-1 h-1.5 rounded-full bg-ink-100 dark:bg-ink-800">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${c.percentage}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Your most bookmarked domains">
          <ul className="space-y-2">
            {domainCounts.map((d) => (
              <li key={d.domain}>
                <button
                  type="button"
                  onClick={() => onNavigate('search', { q: `domain:${d.domain}` })}
                  className="flex w-full items-center justify-between text-left text-sm"
                >
                  <span className="text-ink-700 dark:text-ink-200">{d.domain}</span>
                  <span className="text-ink-400">{d.count.toLocaleString()}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card
        title="Your forgotten bookmarks"
        action={
          <button
            type="button"
            onClick={() => onNavigate('forgotten')}
            className="text-xs font-medium text-brand-600 dark:text-brand-400"
          >
            Review all
          </button>
        }
      >
        <p className="text-sm text-ink-600 dark:text-ink-300">
          You have <strong>{forgotten.length.toLocaleString()}</strong> bookmarks older than{' '}
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
              {opt.label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
