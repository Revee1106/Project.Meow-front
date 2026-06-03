import { useEffect, useMemo, useState } from "react";

export function useLazySlice<T>(items: T[], initialCount = 20, step = 20) {
  const [visibleCount, setVisibleCount] = useState(initialCount);

  useEffect(() => {
    setVisibleCount(initialCount);
  }, [initialCount, items]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );
  const hasMore = visibleCount < items.length;

  return {
    visibleItems,
    hasMore,
    showMore: () => setVisibleCount((count) => Math.min(count + step, items.length)),
  };
}
