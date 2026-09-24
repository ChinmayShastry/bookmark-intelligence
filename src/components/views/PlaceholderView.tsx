interface PlaceholderViewProps {
  title: string;
}

/** Temporary stand-in while a view is still being built out; every view
 * listed in the sidebar is replaced with real functionality before ship. */
export function PlaceholderView({ title }: PlaceholderViewProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-10 text-center">
      <h1 className="text-lg font-semibold text-ink-900 dark:text-white">{title}</h1>
      <p className="text-sm text-ink-500 dark:text-ink-400">This view is under construction.</p>
    </div>
  );
}
