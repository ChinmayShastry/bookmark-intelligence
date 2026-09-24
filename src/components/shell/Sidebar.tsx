import { Shield, HardDrive } from 'lucide-react';
import { PRIMARY_NAV, SECONDARY_NAV } from '../../lib/router/navConfig';
import { useAppState } from '../../lib/store/hooks';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  storageLabel: string | null;
}

function NavList({
  items,
  currentView,
  onNavigate,
}: {
  items: typeof PRIMARY_NAV;
  currentView: string;
  onNavigate: (view: string) => void;
}) {
  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const active = currentView === item.view;
        const Icon = item.icon;
        return (
          <li key={item.view}>
            <button
              type="button"
              onClick={() => onNavigate(item.view)}
              aria-current={active ? 'page' : undefined}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                  : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white'
              }`}
            >
              <Icon size={17} strokeWidth={2} className="shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function Sidebar({ currentView, onNavigate, storageLabel }: SidebarProps) {
  const bookmarkCount = useAppState((s) => s.bookmarks.length);

  return (
    <nav
      aria-label="Main navigation"
      className="hidden w-64 shrink-0 flex-col border-r border-ink-100 bg-ink-50/50 md:flex dark:border-ink-800 dark:bg-ink-900/40"
    >
      <div className="flex items-center gap-2 px-5 py-5">
        <img src="/favicon.svg" alt="" width="26" height="26" className="rounded-lg" />
        <span className="text-sm font-semibold tracking-tight text-ink-900 dark:text-white">
          Bookmark Intelligence
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-4">
        <NavList items={PRIMARY_NAV} currentView={currentView} onNavigate={onNavigate} />
        <div className="my-3 border-t border-ink-200 dark:border-ink-800" />
        <NavList items={SECONDARY_NAV} currentView={currentView} onNavigate={onNavigate} />
      </div>

      <div className="border-t border-ink-200 px-3 py-3 dark:border-ink-800">
        <button
          type="button"
          onClick={() => onNavigate('privacy-center')}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-white"
        >
          <Shield size={16} aria-hidden="true" />
          Privacy
        </button>
        <div className="flex items-center gap-2.5 px-3 py-2 text-xs text-ink-500 dark:text-ink-400">
          <HardDrive size={14} aria-hidden="true" />
          <span>
            {bookmarkCount.toLocaleString()} bookmarks{storageLabel ? ` · ${storageLabel}` : ''}
          </span>
        </div>
        <div className="px-1 pt-1">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
