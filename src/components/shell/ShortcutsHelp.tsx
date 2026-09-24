const SHORTCUTS: Array<[string, string]> = [
  ['/', 'Focus search'],
  ['N', 'Import bookmarks'],
  ['Esc', 'Close panel or dialog'],
  ['?', 'Show this shortcut list'],
  ['Ctrl / Cmd + K', 'Open command palette'],
];

interface ShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
}

export function ShortcutsHelp({ open, onClose }: ShortcutsHelpProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 px-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl border border-ink-200 bg-white p-5 shadow-2xl animate-slide-up dark:border-ink-700 dark:bg-ink-900"
      >
        <h2 className="text-sm font-semibold text-ink-900 dark:text-white">Keyboard shortcuts</h2>
        <ul className="mt-3 space-y-2">
          {SHORTCUTS.map(([key, label]) => (
            <li key={key} className="flex items-center justify-between text-sm">
              <span className="text-ink-600 dark:text-ink-300">{label}</span>
              <kbd className="rounded border border-ink-200 bg-ink-50 px-2 py-0.5 font-mono text-xs text-ink-600 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300">
                {key}
              </kbd>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-ink-100 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-200 dark:hover:bg-ink-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
