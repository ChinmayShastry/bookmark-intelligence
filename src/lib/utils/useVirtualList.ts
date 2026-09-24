import { useEffect, useRef, useState } from 'react';

export interface VirtualRange {
  startIndex: number;
  endIndex: number;
  offsetY: number;
  totalHeight: number;
}

/**
 * Fixed-row-height windowing so a list of 10,000+ bookmarks never renders
 * more than a couple dozen DOM nodes at once. Hand-rolled instead of a
 * dependency since the list only ever has one row shape.
 */
export function useVirtualList(itemCount: number, itemHeight: number, overscan = 6) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState<VirtualRange>({
    startIndex: 0,
    endIndex: Math.min(itemCount, 30),
    offsetY: 0,
    totalHeight: itemCount * itemHeight,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const update = () => {
      const scrollTop = el.scrollTop;
      const viewportHeight = el.clientHeight || 600;
      const maxStart = Math.max(0, itemCount - 1);
      const rawStart = Math.floor(scrollTop / itemHeight) - overscan;
      const start = Math.min(maxStart, Math.max(0, rawStart));
      const visibleCount = Math.ceil(viewportHeight / itemHeight) + overscan * 2;
      const end = Math.min(itemCount, start + visibleCount);
      setRange({ startIndex: start, endIndex: end, offsetY: start * itemHeight, totalHeight: itemCount * itemHeight });
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      resizeObserver.disconnect();
    };
  }, [itemCount, itemHeight, overscan]);

  return { containerRef, range };
}
