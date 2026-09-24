import { getDB, clearAllData as clearAllStores } from '../db/schema';
import { buildDefaultCategories } from '../classifier/defaultCategories';
import { DEFAULT_SETTINGS, type AppSettings, type Bookmark, type Category, type Collection, type Tag } from '../db/types';
import { slugify } from '../utils/id';

export interface AppState {
  status: 'loading' | 'ready';
  bookmarks: Bookmark[];
  categories: Category[];
  tags: Tag[];
  collections: Collection[];
  settings: AppSettings;
  metadata: Record<string, unknown>;
}

type Listener = () => void;
type Patch<T> = Partial<T> | ((current: T) => Partial<T>);

const WRITE_CHUNK_SIZE = 1000;

export interface RestoreData {
  bookmarks: Bookmark[];
  categories: Category[];
  tags: Tag[];
  collections: Collection[];
  settings: AppSettings;
}

export class AppStore {
  private state: AppState = {
    status: 'loading',
    bookmarks: [],
    categories: [],
    tags: [],
    collections: [],
    settings: DEFAULT_SETTINGS,
    metadata: {},
  };
  private listeners = new Set<Listener>();
  private initPromise: Promise<void> | null = null;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getState = (): AppState => this.state;

  private setState(patch: Partial<AppState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((listener) => listener());
  }

  async init(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.loadFromDb();
    }
    return this.initPromise;
  }

  private async loadFromDb(): Promise<void> {
    const db = await getDB();
    const [bookmarks, tags, collections, metadataRows] = await Promise.all([
      db.getAll('bookmarks'),
      db.getAll('tags'),
      db.getAll('collections'),
      db.getAll('metadata'),
    ]);

    let categories = await db.getAll('categories');
    if (categories.length === 0) {
      categories = buildDefaultCategories();
      const tx = db.transaction('categories', 'readwrite');
      await Promise.all([...categories.map((c) => tx.store.put(c)), tx.done]);
    }

    let settings = await db.get('settings', 'app');
    if (!settings) {
      settings = { ...DEFAULT_SETTINGS };
      await db.put('settings', settings);
    }

    const metadata = Object.fromEntries(metadataRows.map((row) => [row.key, row.value]));

    this.setState({ status: 'ready', bookmarks, categories, tags, collections, settings, metadata });
  }

  async setMetadata(key: string, value: unknown): Promise<void> {
    const db = await getDB();
    await db.put('metadata', { key, value });
    this.setState({ metadata: { ...this.state.metadata, [key]: value } });
  }

  private async writeBookmarksChunked(bookmarks: Bookmark[]): Promise<void> {
    const db = await getDB();
    for (let i = 0; i < bookmarks.length; i += WRITE_CHUNK_SIZE) {
      const chunk = bookmarks.slice(i, i + WRITE_CHUNK_SIZE);
      const tx = db.transaction('bookmarks', 'readwrite');
      await Promise.all([...chunk.map((b) => tx.store.put(b)), tx.done]);
      // Yield back to the event loop between chunks so a large import never
      // blocks the UI thread for more than one chunk at a time.
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  // ---------------- bookmarks ----------------

  async addBookmarks(newBookmarks: Bookmark[], onProgress?: (done: number, total: number) => void): Promise<void> {
    const db = await getDB();
    for (let i = 0; i < newBookmarks.length; i += WRITE_CHUNK_SIZE) {
      const chunk = newBookmarks.slice(i, i + WRITE_CHUNK_SIZE);
      const tx = db.transaction('bookmarks', 'readwrite');
      await Promise.all([...chunk.map((b) => tx.store.put(b)), tx.done]);
      onProgress?.(Math.min(i + chunk.length, newBookmarks.length), newBookmarks.length);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    this.setState({ bookmarks: [...this.state.bookmarks, ...newBookmarks] });
  }

  async updateBookmark(id: string, patch: Patch<Bookmark>): Promise<void> {
    return this.updateBookmarks([id], patch);
  }

  async updateBookmarks(ids: string[], patch: Patch<Bookmark>): Promise<void> {
    const idSet = new Set(ids);
    const updated: Bookmark[] = [];
    const nextBookmarks = this.state.bookmarks.map((bookmark) => {
      if (!idSet.has(bookmark.id)) return bookmark;
      const p = typeof patch === 'function' ? patch(bookmark) : patch;
      const next = { ...bookmark, ...p, lastModified: Date.now() };
      updated.push(next);
      return next;
    });
    if (updated.length === 0) return;
    const db = await getDB();
    const tx = db.transaction('bookmarks', 'readwrite');
    await Promise.all([...updated.map((b) => tx.store.put(b)), tx.done]);
    this.setState({ bookmarks: nextBookmarks });
  }

  async deleteBookmarks(ids: string[]): Promise<void> {
    const idSet = new Set(ids);
    const db = await getDB();
    const tx = db.transaction('bookmarks', 'readwrite');
    await Promise.all([...ids.map((id) => tx.store.delete(id)), tx.done]);
    this.setState({ bookmarks: this.state.bookmarks.filter((b) => !idSet.has(b.id)) });
  }

  // ---------------- categories ----------------

  async addCategory(name: string): Promise<Category> {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Category name cannot be empty.');
    const id = slugify(trimmed);
    if (this.state.categories.some((c) => c.id === id)) {
      throw new Error('A category with this name already exists.');
    }
    const category: Category = { id, name: trimmed, keywords: [], domains: [], builtIn: false, createdAt: Date.now() };
    const db = await getDB();
    await db.put('categories', category);
    this.setState({ categories: [...this.state.categories, category] });
    return category;
  }

  async renameCategory(id: string, name: string): Promise<void> {
    const trimmed = name.trim();
    if (!trimmed) return;
    const category = this.state.categories.find((c) => c.id === id);
    if (!category) return;
    const updated = { ...category, name: trimmed };
    const db = await getDB();
    await db.put('categories', updated);
    this.setState({ categories: this.state.categories.map((c) => (c.id === id ? updated : c)) });
  }

  async deleteCategory(id: string): Promise<void> {
    const db = await getDB();
    const nextBookmarks = this.state.bookmarks.map((b) =>
      b.categories.includes(id)
        ? { ...b, categories: b.categories.filter((c) => c !== id), lastModified: Date.now() }
        : b
    );
    const changed = nextBookmarks.filter((b, i) => b !== this.state.bookmarks[i]);
    const tx = db.transaction(['categories', 'bookmarks'], 'readwrite');
    tx.objectStore('categories').delete(id);
    await Promise.all([...changed.map((b) => tx.objectStore('bookmarks').put(b)), tx.done]);
    this.setState({
      categories: this.state.categories.filter((c) => c.id !== id),
      bookmarks: nextBookmarks,
    });
  }

  async mergeCategories(fromId: string, intoId: string): Promise<void> {
    if (fromId === intoId) return;
    const db = await getDB();
    const nextBookmarks = this.state.bookmarks.map((b) => {
      if (!b.categories.includes(fromId)) return b;
      const categories = Array.from(new Set(b.categories.map((c) => (c === fromId ? intoId : c))));
      return { ...b, categories, lastModified: Date.now() };
    });
    const changed = nextBookmarks.filter((b, i) => b !== this.state.bookmarks[i]);
    const tx = db.transaction(['categories', 'bookmarks'], 'readwrite');
    tx.objectStore('categories').delete(fromId);
    await Promise.all([...changed.map((b) => tx.objectStore('bookmarks').put(b)), tx.done]);
    this.setState({
      categories: this.state.categories.filter((c) => c.id !== fromId),
      bookmarks: nextBookmarks,
    });
  }

  // ---------------- tags ----------------

  async ensureTags(names: string[]): Promise<string[]> {
    const existingBySlug = new Map(this.state.tags.map((t) => [t.id, t]));
    const newTags: Tag[] = [];
    const ids: string[] = [];
    for (const rawName of names) {
      const name = rawName.trim();
      if (!name) continue;
      const id = slugify(name);
      ids.push(id);
      if (!existingBySlug.has(id)) {
        const tag: Tag = { id, name, createdAt: Date.now() };
        newTags.push(tag);
        existingBySlug.set(id, tag);
      }
    }
    if (newTags.length) {
      const db = await getDB();
      const tx = db.transaction('tags', 'readwrite');
      await Promise.all([...newTags.map((t) => tx.store.put(t)), tx.done]);
      this.setState({ tags: [...this.state.tags, ...newTags] });
    }
    return Array.from(new Set(ids));
  }

  async renameTag(id: string, name: string): Promise<void> {
    const trimmed = name.trim();
    if (!trimmed) return;
    const tag = this.state.tags.find((t) => t.id === id);
    if (!tag) return;
    const updated = { ...tag, name: trimmed };
    const db = await getDB();
    await db.put('tags', updated);
    this.setState({ tags: this.state.tags.map((t) => (t.id === id ? updated : t)) });
  }

  async deleteTag(id: string): Promise<void> {
    const db = await getDB();
    const nextBookmarks = this.state.bookmarks.map((b) =>
      b.tags.includes(id) ? { ...b, tags: b.tags.filter((t) => t !== id), lastModified: Date.now() } : b
    );
    const changed = nextBookmarks.filter((b, i) => b !== this.state.bookmarks[i]);
    const tx = db.transaction(['tags', 'bookmarks'], 'readwrite');
    tx.objectStore('tags').delete(id);
    await Promise.all([...changed.map((b) => tx.objectStore('bookmarks').put(b)), tx.done]);
    this.setState({
      tags: this.state.tags.filter((t) => t.id !== id),
      bookmarks: nextBookmarks,
    });
  }

  async mergeTags(fromId: string, intoId: string): Promise<void> {
    if (fromId === intoId) return;
    const db = await getDB();
    const nextBookmarks = this.state.bookmarks.map((b) => {
      if (!b.tags.includes(fromId)) return b;
      const tags = Array.from(new Set(b.tags.map((t) => (t === fromId ? intoId : t))));
      return { ...b, tags, lastModified: Date.now() };
    });
    const changed = nextBookmarks.filter((b, i) => b !== this.state.bookmarks[i]);
    const tx = db.transaction(['tags', 'bookmarks'], 'readwrite');
    tx.objectStore('tags').delete(fromId);
    await Promise.all([...changed.map((b) => tx.objectStore('bookmarks').put(b)), tx.done]);
    this.setState({
      tags: this.state.tags.filter((t) => t.id !== fromId),
      bookmarks: nextBookmarks,
    });
  }

  // ---------------- collections ----------------

  async addCollection(name: string, bookmarkIds: string[] = []): Promise<Collection> {
    const collection: Collection = { id: slugify(`${name}-${Date.now()}`), name: name.trim(), bookmarkIds, createdAt: Date.now() };
    const db = await getDB();
    await db.put('collections', collection);
    this.setState({ collections: [...this.state.collections, collection] });
    return collection;
  }

  async deleteCollection(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('collections', id);
    this.setState({ collections: this.state.collections.filter((c) => c.id !== id) });
  }

  // ---------------- settings ----------------

  async updateSettings(patch: Partial<AppSettings>): Promise<void> {
    const next = { ...this.state.settings, ...patch };
    const db = await getDB();
    await db.put('settings', next);
    this.setState({ settings: next });
  }

  // ---------------- danger zone ----------------

  async clearAllData(): Promise<void> {
    await clearAllStores();
    const categories = buildDefaultCategories();
    const settings = { ...DEFAULT_SETTINGS };
    const db = await getDB();
    const tx = db.transaction(['categories', 'settings'], 'readwrite');
    await Promise.all([...categories.map((c) => tx.objectStore('categories').put(c)), tx.objectStore('settings').put(settings), tx.done]);
    this.setState({ bookmarks: [], categories, tags: [], collections: [], settings, metadata: {} });
  }

  async restoreFromBackup(data: RestoreData): Promise<void> {
    await clearAllStores();
    const db = await getDB();
    const tx = db.transaction(['categories', 'tags', 'collections', 'settings'], 'readwrite');
    await Promise.all([
      ...data.categories.map((c) => tx.objectStore('categories').put(c)),
      ...data.tags.map((t) => tx.objectStore('tags').put(t)),
      ...data.collections.map((c) => tx.objectStore('collections').put(c)),
      tx.objectStore('settings').put(data.settings),
      tx.done,
    ]);
    await this.writeBookmarksChunked(data.bookmarks);
    this.setState({
      bookmarks: data.bookmarks,
      categories: data.categories,
      tags: data.tags,
      collections: data.collections,
      settings: data.settings,
      metadata: {},
    });
  }
}

export const appStore = new AppStore();
