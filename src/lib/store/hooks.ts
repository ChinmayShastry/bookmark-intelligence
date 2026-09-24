import { useSyncExternalStore } from 'react';
import { appStore, type AppState } from './appStore';

/**
 * Select a slice of app state. Selectors should return a stable reference
 * (a raw field like `state.bookmarks`) rather than deriving a new array or
 * object inline — React's `useSyncExternalStore` requires the snapshot to
 * be referentially stable when nothing changed. Do derived filtering with
 * `useMemo` in the component instead.
 */
export function useAppState<T>(selector: (state: AppState) => T): T {
  return useSyncExternalStore(
    appStore.subscribe,
    () => selector(appStore.getState()),
    () => selector(appStore.getState())
  );
}

export function useAppStore() {
  return appStore;
}
