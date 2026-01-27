import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";
import ReceiptCard from "./ReceiptCard";
import EmptyState from "./EmptyState";
import type { DashboardReceiptItem, ImportMode } from "@/types/import-dashboard.types";

interface ReceiptInboxProps {
  /**
   * Receipts to display
   */
  receipts: DashboardReceiptItem[];

  /**
   * Current mode (for empty state)
   */
  mode: ImportMode;

  /**
   * Click handler for receipt cards
   */
  onReceiptClick?: (receipt: DashboardReceiptItem) => void;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Empty state action handler
   */
  onEmptyAction?: () => void;

  /**
   * Custom className
   */
  className?: string;
}

/**
 * Virtualization threshold - use virtualization when more than this many receipts
 */
const VIRTUALIZATION_THRESHOLD = 50;

/**
 * Number of columns in the grid
 */
const GRID_COLUMNS = 3;

/**
 * Estimated row height for virtualization calculations (in pixels)
 */
const ESTIMATED_ROW_HEIGHT = 200;

/**
 * ReceiptInbox - Main inbox grid with virtualization for large lists
 * Uses Hard Line v2.1 aesthetic with responsive grid layout
 */
const ReceiptInbox: React.FC<ReceiptInboxProps> = ({
  receipts,
  mode,
  onReceiptClick,
  isLoading = false,
  onEmptyAction,
  className = "",
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Calculate virtualization needs before any conditional returns
  const shouldVirtualize = receipts.length > VIRTUALIZATION_THRESHOLD;
  const rowCount = Math.ceil(receipts.length / GRID_COLUMNS);

  // Always call useVirtualizer (React Hooks must be called unconditionally)
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: React.useCallback(() => parentRef.current, []),
    estimateSize: React.useCallback(() => ESTIMATED_ROW_HEIGHT, []),
    overscan: 2,
  });

  // Show empty state when not loading and no receipts
  if (!isLoading && receipts.length === 0) {
    return (
      <div className={className} data-testid="receipt-inbox-empty">
        <EmptyState mode={mode} onAction={onEmptyAction} />
      </div>
    );
  }

  // Show loading skeleton
  if (isLoading) {
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}
        data-testid="receipt-inbox-loading"
        aria-busy="true"
        aria-label="Loading receipts"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="
              h-48 bg-gray-100 border-2 border-black rounded-2xl
              shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
              animate-pulse
            "
            data-testid="receipt-skeleton"
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  // Non-virtualized simple grid
  if (!shouldVirtualize) {
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}
        data-testid="receipt-inbox"
        data-virtualized="false"
      >
        <AnimatePresence mode="popLayout">
          {receipts.map((receipt) => (
            <motion.div
              layout
              key={receipt.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <ReceiptCard receipt={receipt} onClick={onReceiptClick} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  // Virtualized grid with row-based virtualization
  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      data-testid="receipt-inbox"
      data-virtualized="true"
      style={{ height: "100%", width: "100%" }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIdx = virtualRow.index * GRID_COLUMNS;
          const rowReceipts = receipts.slice(startIdx, startIdx + GRID_COLUMNS);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
              data-testid="virtual-row"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
                {rowReceipts.map((receipt) => (
                  <ReceiptCard key={receipt.id} receipt={receipt} onClick={onReceiptClick} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReceiptInbox;
