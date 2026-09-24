import { LayoutDashboard, Bookmark, Search, BarChart3, Settings } from 'lucide-react';

const MOBILE_ITEMS = [
  { view: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { view: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  { view: 'search', label: 'Search', icon: Search },
  { view: 'insights', label: 'Insights', icon: BarChart3 },
  { view: 'settings', label: 'Settings', icon: Settings },
];

interface MobileNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export function MobileNav({ currentView, onNavigate }: MobileNavProps) {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-ink-200 bg-white/95 backdrop-blur-md md:hidden dark:border-ink-800 dark:bg-ink-950/95"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {MOBILE_ITEMS.map((item) => {
        const active = currentView === item.view;
        const Icon = item.icon;
        return (
          <button
            key={item.view}
            type="button"
            onClick={() => onNavigate(item.view)}
            aria-current={active ? 'page' : undefined}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
              active ? 'text-brand-600 dark:text-brand-400' : 'text-ink-500 dark:text-ink-400'
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
