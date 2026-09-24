export interface BrowserExportSteps {
  browser: string;
  steps: string[];
}

/** Shared between the in-app Import view and the public export guide page. */
export const EXPORT_STEPS: BrowserExportSteps[] = [
  {
    browser: 'Chrome',
    steps: [
      'Open Bookmarks → Bookmark Manager (Ctrl/Cmd + Shift + O)',
      'Click the ⋮ menu in the top right',
      'Choose "Export bookmarks" and save the HTML file',
    ],
  },
  {
    browser: 'Edge',
    steps: [
      'Open Favorites → Manage favorites',
      'Click the ⋯ menu',
      'Choose "Export favorites" and save the HTML file',
    ],
  },
  {
    browser: 'Firefox',
    steps: [
      'Open the Library (Ctrl/Cmd + Shift + O)',
      'Click "Import and Backup" → "Export Bookmarks to HTML..."',
      'Save the file',
    ],
  },
  {
    browser: 'Brave',
    steps: ['Open Bookmarks → Bookmark Manager', 'Click the ⋮ menu', 'Choose "Export bookmarks" and save the HTML file'],
  },
  {
    browser: 'Safari',
    steps: ['Open File → Export Bookmarks…', 'Save the HTML file'],
  },
];
