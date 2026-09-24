import {
  LayoutDashboard,
  Bookmark,
  Layers,
  BookOpenCheck,
  BarChart3,
  Copy,
  History,
  Globe,
  Tag,
  FolderTree,
  Upload,
  Download,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  view: string;
  label: string;
  icon: LucideIcon;
  shortcut?: string;
}

export const PRIMARY_NAV: NavItem[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  { view: 'collections', label: 'Collections', icon: Layers },
  { view: 'reading-queue', label: 'Reading Queue', icon: BookOpenCheck },
  { view: 'insights', label: 'Insights', icon: BarChart3 },
  { view: 'duplicates', label: 'Duplicates', icon: Copy },
  { view: 'forgotten', label: 'Forgotten', icon: History },
  { view: 'domains', label: 'Domains', icon: Globe },
  { view: 'tags', label: 'Tags', icon: Tag },
  { view: 'categories', label: 'Categories', icon: FolderTree },
];

export const SECONDARY_NAV: NavItem[] = [
  { view: 'import', label: 'Import', icon: Upload, shortcut: 'N' },
  { view: 'export', label: 'Export', icon: Download },
  { view: 'settings', label: 'Settings', icon: Settings },
];

export const ALL_NAV = [...PRIMARY_NAV, ...SECONDARY_NAV];
