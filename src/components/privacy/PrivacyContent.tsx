const POINTS: Array<{ title: string; body: string }> = [
  {
    title: 'No account required',
    body: 'There is no sign-up, no login, and no user profile anywhere in this product.',
  },
  {
    title: 'No bookmark uploads',
    body: 'Your bookmark HTML export is read directly in your browser via the File API and is never sent over the network — not during import, not during search, not ever.',
  },
  {
    title: 'No cloud database',
    body: 'There is no backend server for this product. Your bookmarks, tags, categories, notes, and settings live only in this browser’s IndexedDB storage, on this device.',
  },
  {
    title: 'No AI API',
    body: 'Categorization, tag suggestions, duplicate detection, and search are all deterministic, local algorithms. No bookmark title, URL, or note is ever sent to any AI model or third-party service.',
  },
  {
    title: 'No favicon or link-preview services',
    body: 'A favicon is only shown if your browser’s own export already embedded it. We deliberately never fetch icons from a third-party favicon service, since that would leak every domain you’ve bookmarked to it.',
  },
  {
    title: 'No tracking of bookmark contents',
    body: 'Nothing about what you bookmark, search for, tag, or organize is logged, measured, or transmitted anywhere.',
  },
  {
    title: 'Export anytime',
    body: 'JSON, CSV, and standard bookmark HTML exports are available from the Export page at any time, with no restriction.',
  },
  {
    title: 'Delete local data anytime',
    body: 'Settings → "Delete all local data" permanently clears everything this app has stored in your browser, immediately.',
  },
];

export function PrivacyContent() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink-900 dark:text-white">Your bookmarks are yours.</h1>
      <p className="mt-3 text-sm text-ink-600 dark:text-ink-300">
        Bookmark Intelligence is built so that your bookmark data never has a reason to leave this device. Here is
        exactly what that means, in plain terms — no marketing language, just what the code actually does.
      </p>

      <dl className="mt-8 space-y-6">
        {POINTS.map((point) => (
          <div key={point.title}>
            <dt className="text-sm font-semibold text-ink-900 dark:text-white">{point.title}</dt>
            <dd className="mt-1 text-sm text-ink-600 dark:text-ink-300">{point.body}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 rounded-xl border border-ink-100 bg-ink-50/60 p-4 text-sm text-ink-600 dark:border-ink-800 dark:bg-ink-900/40 dark:text-ink-300">
        <p className="font-semibold text-ink-800 dark:text-ink-100">Being precise about what "private" means here</p>
        <p className="mt-1">
          This app currently ships with no analytics of any kind. If that ever changes, this page will be updated to
          say exactly what is measured — anonymous product events only (e.g. "an import finished"), never bookmark
          URLs, titles, or search queries. We won't claim "zero tracking" if that stops being true.
        </p>
      </div>
    </div>
  );
}
