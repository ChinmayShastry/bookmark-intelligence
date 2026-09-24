import type { HealthBreakdown } from '../../lib/selectors/stats';

const PILLARS: Array<{ key: keyof Omit<HealthBreakdown, 'total'>; label: string; explain: string }> = [
  { key: 'organization', label: 'Organization', explain: 'Share of bookmarks assigned a real category' },
  { key: 'duplicates', label: 'Duplicates', explain: 'Lower duplicate ratio scores higher' },
  { key: 'tagging', label: 'Tagging', explain: 'Share of bookmarks with at least one tag' },
  { key: 'activity', label: 'Active usage', explain: "Share that aren't forgotten (favorited/archived don't count against you)" },
  { key: 'folderStructure', label: 'Folder structure', explain: 'Share of foldered bookmarks outside generically-named folders' },
];

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

interface HealthScoreWidgetProps {
  breakdown: HealthBreakdown;
  compact?: boolean;
}

export function HealthScoreWidget({ breakdown, compact = false }: HealthScoreWidgetProps) {
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-semibold ${scoreColor(breakdown.total)}`}>{breakdown.total}</span>
        <span className="text-sm text-ink-400">/ 100</span>
      </div>
      <div className="mt-3 space-y-2">
        {PILLARS.map((pillar) => {
          const score = breakdown[pillar.key];
          return (
            <div key={pillar.key}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-600 dark:text-ink-300">{pillar.label}</span>
                <span className="text-ink-400">{score}/20</span>
              </div>
              <div className="mt-0.5 h-1.5 rounded-full bg-ink-100 dark:bg-ink-800">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${(score / 20) * 100}%` }} />
              </div>
              {!compact && <p className="mt-0.5 text-[11px] text-ink-400">{pillar.explain}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
