# Bookmark Intelligence

> Turn your bookmark chaos into organized knowledge.

A privacy-first bookmark manager that imports, organizes, searches, analyzes, cleans up, and helps you
rediscover your browser bookmarks — entirely on your device. No account, no uploads, no cloud database,
no AI API. It ships as a static site and runs 100% client-side.

## What it actually does

- **Import** — reads a Chrome/Edge/Brave/Firefox/Safari bookmark HTML export locally (Web Worker, never
  freezes the UI), with a preview (total, duplicates, empty folders, untitled) before anything is written.
- **Organize** — a deterministic, local keyword/domain classifier suggests categories and tags. No network
  call, no AI API. Categories are user-editable (rename/merge/delete/create).
- **Search** — instant fuzzy search (Fuse.js) plus operators (`tag:ai`, `domain:github.com`,
  `category:finance`, `favorite:true`, `duplicate:true`, `before:2024-01-01`, ...) and smart keywords
  (`duplicates`, `untagged`, `favorites`, `recent`, `old`).
- **Analyze** — a transparent, explainable Bookmark Health score (5 pillars × 20 points), category/domain
  breakdowns, a monthly growth chart, and a duplicate finder with Keep newest/oldest/selected/Merge/Ignore.
- **Rediscover** — a "forgotten bookmarks" queue with a configurable threshold and a one-click
  Still-useful/Archive/Delete flow, plus a Reading Queue for "read later" saves.
- **Own your data** — export JSON/CSV/HTML at any time, create/restore a full JSON backup, or permanently
  delete everything with one explicit, confirmed action.

See [`/privacy`](src/pages/privacy.astro) for the exact, technically-honest privacy explanation, and the
[guides](src/pages/guides) for how the classifier, duplicate detection, and cleanup process actually work.

## Tech stack

- **Astro** (static output) + **React** islands for the interactive workspace
- **TypeScript**, **Tailwind CSS v4**
- **IndexedDB** (via the tiny `idb` wrapper) for all persistence — nothing in localStorage except a
  purely-cosmetic theme flag used to avoid a flash of the wrong theme before the app loads
- **Fuse.js** for fuzzy search, **Chart.js** for the growth chart, **PapaParse** for CSV export
- A hand-rolled Netscape bookmark HTML parser and virtualized list (no dependency needed for either)
- **Vitest** for unit tests

No backend, no server framework, no database server, no AI API.

## Getting started

```bash
npm install
npm run dev       # http://localhost:4321
```

Other scripts:

```bash
npm run build     # astro check + production build to dist/
npm run preview   # serve the production build locally
npm test          # run the Vitest suite once
npm run test:watch
```

## Architecture

```
src/
├── components/
│   ├── App.tsx            # root of the /app React island: routing, theme, onboarding gate
│   ├── shell/              # sidebar, top bar, command palette, mobile nav
│   ├── bookmarks/          # card, filter bar, bulk actions, detail panel
│   ├── views/              # one component per sidebar destination
│   ├── insights/, privacy/, common/
├── layouts/                # Astro layouts (marketing site + article pages)
├── pages/                  # Astro routes: landing, /app, /privacy, guides, SEO pages
├── lib/
│   ├── db/                 # IndexedDB schema (idb) + types
│   ├── store/               # reactive in-memory AppStore (useSyncExternalStore) backed by IndexedDB
│   ├── parser/              # Netscape bookmark HTML tokenizer
│   ├── classifier/          # keyword/domain category + tag engine, folder-intelligence heuristic
│   ├── search/              # query operator parser + Fuse.js index (cached across keystrokes)
│   ├── normalization/       # URL normalization for duplicate detection
│   ├── duplicates/, selectors/, export/, backup/, demo/, linkcheck/, content/
├── workers/
│   └── import.worker.ts     # parses + classifies a bookmark file off the main thread
└── styles/global.css        # Tailwind v4 theme tokens, dark mode via [data-theme]
```

**State model.** `AppStore` (`lib/store/appStore.ts`) loads everything from IndexedDB once at startup into
an in-memory snapshot, and every mutation writes through to IndexedDB and then updates the snapshot.
Components subscribe via `useAppState(selector)`. This keeps filtering/sorting/searching fast (pure
in-memory array operations) while IndexedDB remains the single source of truth and survives reloads.

**Import pipeline.** `ImportView` reads the file, hands the HTML to a Web Worker
(`workers/import.worker.ts`) that parses and classifies every bookmark off the main thread, and returns a
preview *before anything is persisted*. Only after the user picks "Import Everything" or "Review First"
does `commitImportPreview` write to IndexedDB, in chunks of 1,000 with a yield between chunks, so even a
50,000-bookmark import keeps the UI responsive.

**Search.** `searchBookmarks()` parses operators/smart-keywords out of the query, applies them as filters,
and only runs Fuse.js over whatever free text remains. The Fuse index is cached by the filtered-candidate
array's identity, so typing more characters against an unfiltered library doesn't rebuild a 50k-item index
on every keystroke.

## Performance

Verified against a synthetic 12,000-bookmark import in a real (headless Chromium) browser:

| Step | Time |
|---|---|
| Parse + classify 12,000 bookmarks (Web Worker) | ~3.4s |
| Write 12,000 bookmarks to IndexedDB (chunked) | ~5.9s |
| Longest single UI-thread stall during the whole import | **49ms** |
| Fuzzy search across 12,000 bookmarks | ~270ms compute (well under the debounce) |
| DOM rows rendered for a 12,000-bookmark list | **22** (virtualized) |

The architecture (Web Worker parsing, chunked IndexedDB writes, a cached Fuse index, and a hand-rolled
virtualized list) is what makes this hold up — none of it is dataset-size-specific, so it's expected to
scale similarly toward 50,000+.

## Testing

`npm test` runs Vitest unit tests covering URL normalization, the bookmark HTML parser (including
malformed/empty-folder/untitled/entity-decoding cases), the classifier, duplicate detection, the search
query parser, the demo data generator, and backup/restore round-tripping (48 tests).

Beyond unit tests, this project was verified end-to-end in a real headless Chromium session across every
sidebar destination, dark mode, the command palette, real bookmark-file import, duplicate resolution,
collections, the reading queue, export/backup/restore, "Clear all data", the offline PWA shell, and an
automated WCAG 2 A/AA audit (axe-core) — all with zero console errors and zero accessibility violations.
That verification isn't checked into CI (it drove development, not a repeatable suite); Vitest is what's
included as regression coverage.

## Deployment

This is a fully static site (`output: 'static'` in `astro.config.mjs`) — `npm run build` produces
`dist/`, deployable as-is to Vercel, Netlify, Cloudflare Pages, or GitHub Pages. No environment variables,
no server, no adapter needed.

**Live on Vercel:** https://bookmark-intelligence.vercel.app — the Vercel project is linked directly to
this repository's `main` branch, so every push redeploys automatically. `site` in `astro.config.mjs` and
the URLs in `public/sitemap.xml`/`public/robots.txt` point at that domain; update them if you move to a
custom domain.

## Known limitations / honest scope notes

- **PWA icons are SVG-only.** The manifest and service worker are real and verified working (including a
  true offline reload), but there's no rasterized PNG icon set, which some install surfaces (notably iOS)
  prefer. Worth adding if this ships broadly.
- **Dead-link checking is intentionally limited.** A per-bookmark "Check link" button in the detail panel
  can tell you a request failed outright, but a cross-origin site without CORS headers (most of the web)
  can never have its real HTTP status read back by a browser — that case is always labeled "unable to
  verify from browser," never guessed at. This is a hard platform constraint, not a shortcut.
- **SEO pages are intentionally fewer than the original brief listed.** Four genuinely distinct pages
  (bookmark-manager, bookmark-organizer, bookmark-cleaner, duplicate-bookmark-finder) plus a small real
  Guides section, rather than a dozen near-duplicate browser-specific variants — prioritizing "every page
  provides genuine information" over raw page count.
- **No analytics are implemented.** The Privacy Center is explicit that this is the current state, not a
  permanent guarantee, and commits to naming exactly what would be tracked (anonymous product events only,
  never bookmark contents) if that ever changes.
- **Cache invalidation.** The service worker uses a versioned cache name (`CACHE_NAME` in `public/sw.js`);
  bump it when shipping a release that must invalidate old cached assets.
