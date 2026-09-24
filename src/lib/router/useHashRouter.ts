import { useCallback, useEffect, useState } from 'react';

export interface Route {
  view: string;
  params: URLSearchParams;
}

function parseHash(): Route {
  if (typeof window === 'undefined') {
    return { view: 'dashboard', params: new URLSearchParams() };
  }
  const raw = window.location.hash.replace(/^#\/?/, '');
  const [path, query] = raw.split('?');
  return { view: path || 'dashboard', params: new URLSearchParams(query ?? '') };
}

export interface HashRouter {
  route: Route;
  navigate: (view: string, params?: Record<string, string>) => void;
}

/** Minimal client-side router for the single-page app shell at /app. Using
 * the hash (rather than the History API) keeps the whole app deployable as
 * static files with no server-side rewrite rules. */
export function useHashRouter(): HashRouter {
  const [route, setRoute] = useState<Route>(() => parseHash());

  useEffect(() => {
    const handler = () => setRoute(parseHash());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = useCallback((view: string, params?: Record<string, string>) => {
    const search = params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
    window.location.hash = `/${view}${search}`;
  }, []);

  return { route, navigate };
}
