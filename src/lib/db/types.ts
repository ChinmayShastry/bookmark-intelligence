export interface Bookmark {
  id: string;
  url: string;
  normalizedUrl: string;
  title: string;
  domain: string;
  folder?: string;
  categories: string[];
  tags: string[];
  notes?: string;
  icon?: string;
  favorite: boolean;
  archived: boolean;
  readLater: boolean;
  readLaterDone?: boolean;
  dateAdded?: number;
  importedAt: number;
  lastModified: number;
  lastOpenedAt?: number;
  source: 'import' | 'manual' | 'demo';
}

export interface Category {
  id: string;
  name: string;
  keywords: string[];
  domains: string[];
  builtIn: boolean;
  createdAt: number;
}

export interface Tag {
  id: string;
  name: string;
  createdAt: number;
}

export interface Collection {
  id: string;
  name: string;
  bookmarkIds: string[];
  createdAt: number;
}

export type ThemePreference = 'light' | 'dark' | 'system';
export type DensityPreference = 'comfortable' | 'compact';

export interface AppSettings {
  key: 'app';
  theme: ThemePreference;
  density: DensityPreference;
  fuzzySensitivity: number;
  autoCategorize: boolean;
  autoTag: boolean;
  forgottenThresholdDays: number;
  onboardingCompleted: boolean;
  duplicateTrackingParamsOnly: boolean;
}

export interface BackupRecord {
  id: string;
  createdAt: number;
  bookmarkCount: number;
  categoryCount: number;
  tagCount: number;
  trigger: 'manual' | 'auto';
}

export interface AppMetadata {
  key: string;
  value: unknown;
}

export const DEFAULT_SETTINGS: AppSettings = {
  key: 'app',
  theme: 'system',
  density: 'comfortable',
  fuzzySensitivity: 0.35,
  autoCategorize: true,
  autoTag: false,
  forgottenThresholdDays: 365,
  onboardingCompleted: false,
  duplicateTrackingParamsOnly: true,
};
