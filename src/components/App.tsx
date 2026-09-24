import { useCallback, useEffect, useState } from 'react';
import { appStore } from '../lib/store/appStore';
import { useAppState, useAppStore } from '../lib/store/hooks';
import { useThemeSync } from '../lib/theme/useThemeSync';
import { useHashRouter } from '../lib/router/useHashRouter';
import { loadDemoData } from '../lib/demo';
import { Sidebar } from './shell/Sidebar';
import { MobileNav } from './shell/MobileNav';
import { TopBar } from './shell/TopBar';
import { CommandPalette } from './shell/CommandPalette';
import { ShortcutsHelp } from './shell/ShortcutsHelp';
import { ImportView } from './views/ImportView';
import { OnboardingView } from './views/OnboardingView';
import { EmptyStateView } from './views/EmptyStateView';
import { PlaceholderView } from './views/PlaceholderView';
import { DashboardView } from './views/DashboardView';
import { BookmarksView } from './views/BookmarksView';
import { CategoriesView } from './views/CategoriesView';
import { TagsView } from './views/TagsView';
import { DuplicatesView } from './views/DuplicatesView';
import { DomainsView } from './views/DomainsView';

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return Boolean(el && (['INPUT', 'TEXTAREA'].includes(el.tagName) || el.isContentEditable));
}

const EMPTY_STATE_VIEWS = new Set(['dashboard', 'bookmarks', 'search']);

function ViewRouter({
  view,
  params,
  onNavigate,
  bookmarkCount,
}: {
  view: string;
  params: URLSearchParams;
  onNavigate: (view: string, params?: Record<string, string>) => void;
  bookmarkCount: number;
}) {
  if (bookmarkCount === 0 && EMPTY_STATE_VIEWS.has(view)) {
    return <EmptyStateView onImport={() => onNavigate('import')} />;
  }

  switch (view) {
    case 'dashboard':
      return <DashboardView onNavigate={onNavigate} />;
    case 'bookmarks':
      return <BookmarksView initialQuery="" title="All Bookmarks" />;
    case 'search':
      return <BookmarksView initialQuery={params.get('q') ?? ''} title="Search" />;
    case 'import':
      return <ImportView onFinished={() => {}} />;
    case 'collections':
      return <PlaceholderView title="Collections" />;
    case 'reading-queue':
      return <PlaceholderView title="Reading Queue" />;
    case 'insights':
      return <PlaceholderView title="Insights" />;
    case 'duplicates':
      return <DuplicatesView />;
    case 'forgotten':
      return <PlaceholderView title="Forgotten" />;
    case 'domains':
      return <DomainsView onNavigate={onNavigate} />;
    case 'tags':
      return <TagsView onNavigate={onNavigate} />;
    case 'categories':
      return <CategoriesView onNavigate={onNavigate} />;
    case 'export':
      return <PlaceholderView title="Export" />;
    case 'settings':
      return <PlaceholderView title="Settings" />;
    case 'privacy-center':
      return <PlaceholderView title="Privacy" />;
    default:
      return <DashboardView onNavigate={onNavigate} />;
  }
}

export default function App() {
  const status = useAppState((s) => s.status);
  const bookmarkCount = useAppState((s) => s.bookmarks.length);
  const onboardingCompleted = useAppState((s) => s.settings.onboardingCompleted);
  const store = useAppStore();
  const { route, navigate } = useHashRouter();

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [autoLoadingDemo, setAutoLoadingDemo] = useState(false);

  useEffect(() => {
    void appStore.init();
  }, []);

  useThemeSync();

  // A marketing-page "Try Demo" link (/app?demo=1) should feel instant —
  // skip the welcome screens and load straight into a populated workspace.
  useEffect(() => {
    if (status !== 'ready') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === '1' && bookmarkCount === 0) {
      setAutoLoadingDemo(true);
      void loadDemoData(store).then(() => {
        void store.updateSettings({ onboardingCompleted: true });
        window.history.replaceState(null, '', window.location.pathname + window.location.hash);
        setAutoLoadingDemo(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleNavigate = useCallback(
    (view: string, params?: Record<string, string>) => {
      if (view === 'favorites') {
        navigate('collections', { id: 'favorites' });
        return;
      }
      navigate(view, params);
    },
    [navigate]
  );

  const handleSearch = useCallback(
    (query: string) => {
      navigate('search', query ? { q: query } : {});
    },
    [navigate]
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }
      if (isTypingTarget(event.target)) return;
      if (event.key === 'n' || event.key === 'N') {
        event.preventDefault();
        handleNavigate('import');
      } else if (event.key === '?') {
        event.preventDefault();
        setHelpOpen(true);
      } else if (event.key === 'Escape') {
        setPaletteOpen(false);
        setHelpOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNavigate]);

  if (status === 'loading' || autoLoadingDemo) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-ink-950">
        <div className="flex flex-col items-center gap-3">
          <img src="/favicon.svg" alt="" width="36" height="36" className="animate-pulse rounded-xl" />
          <p className="text-sm text-ink-500 dark:text-ink-400">
            {autoLoadingDemo ? 'Preparing your demo workspace…' : 'Loading your bookmarks…'}
          </p>
        </div>
      </div>
    );
  }

  if (!onboardingCompleted) {
    return <OnboardingView onComplete={() => store.updateSettings({ onboardingCompleted: true })} />;
  }

  return (
    <div className="flex h-screen bg-white text-ink-900 dark:bg-ink-950 dark:text-ink-100">
      <Sidebar currentView={route.view} onNavigate={handleNavigate} storageLabel={null} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          route={route}
          onSearch={handleSearch}
          onOpenPalette={() => setPaletteOpen(true)}
          onImport={() => handleNavigate('import')}
        />
        <main className="min-h-0 flex-1 overflow-hidden pb-16 md:pb-0">
          <ViewRouter view={route.view} params={route.params} onNavigate={handleNavigate} bookmarkCount={bookmarkCount} />
        </main>
      </div>
      <MobileNav currentView={route.view} onNavigate={handleNavigate} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onNavigate={handleNavigate} />
      <ShortcutsHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
