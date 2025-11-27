import { useRef, useCallback, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

/**
 * Hook for managing envelope grid virtualization
 * Virtualizes envelope grid when there are more than 50 envelopes
 */
export const useEnvelopeGridVirtualization = (
  envelopes: Array<{ id: string; [key: string]: unknown }>,
  threshold = 50
) => {
  const parentRef = useRef<HTMLDivElement | null>(null);

  // Only virtualize if we have more than the threshold
  const shouldVirtualize = envelopes.length > threshold;

  // Calculate grid dimensions for virtualization
  // Assuming responsive grid: 1 col mobile, 2 md, 3 lg, 4 xl
  const getColumnsCount = useCallback(() => {
    if (typeof window === "undefined") return 4;
    const width = window.innerWidth;
    if (width >= 1280) return 4; // xl
    if (width >= 1024) return 3; // lg
    if (width >= 768) return 2; // md
    return 1; // mobile
  }, []);

  // Estimate row height based on envelope card height
  // Envelope cards are approximately 200-300px tall depending on view mode
  const estimateSize = useCallback(() => {
    const cardHeight = 250; // Approximate card height
    const gap = 24; // gap-6 = 24px
    return cardHeight + gap;
  }, []);

  // Calculate number of rows
  const rowsCount = useMemo(() => {
    if (!shouldVirtualize) return 0;
    const columns = getColumnsCount();
    return Math.ceil(envelopes.length / columns);
  }, [envelopes.length, shouldVirtualize, getColumnsCount]);

  // Virtualization setup - only if we should virtualize
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual's useVirtualizer is safe to use here, memoization warning is expected
  const rowVirtualizer = useVirtualizer({
    count: rowsCount,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 2, // Render 2 extra rows above/below viewport
    enabled: shouldVirtualize,
  });

  return {
    parentRef,
    rowVirtualizer,
    shouldVirtualize,
    getColumnsCount,
  };
};
