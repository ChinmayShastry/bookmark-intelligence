import { Globe } from 'lucide-react';

interface FaviconProps {
  icon?: string;
  size?: number;
}

/**
 * Only renders an icon embedded in the bookmark's own export file (a
 * `data:` URI, verified by the parser). We deliberately never fetch a
 * favicon from a third-party service — that would leak every domain the
 * user has bookmarked to that service, which is exactly what "100% local
 * processing" promises not to do.
 */
export function Favicon({ icon, size = 16 }: FaviconProps) {
  if (icon) {
    return <img src={icon} alt="" width={size} height={size} className="rounded-sm" loading="lazy" />;
  }
  return (
    <div
      className="flex items-center justify-center rounded-sm bg-ink-100 text-ink-400 dark:bg-ink-800"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Globe size={size * 0.7} />
    </div>
  );
}
