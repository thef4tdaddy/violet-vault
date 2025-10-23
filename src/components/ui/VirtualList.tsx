import React, { memo, useState, useMemo } from "react";

interface VirtualListProps {
  items: unknown[];
  itemHeight?: number;
  containerHeight?: number;
  renderItem: (item: unknown, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
}

const VirtualList = memo(
  ({
    items = [],
    itemHeight = 80,
    containerHeight = 400,
    renderItem,
    className = "",
    overscan = 5,
  }: VirtualListProps) => {
    const [scrollTop, setScrollTop] = useState(0);

    const visibleRange = useMemo(() => {
      const visibleStart = Math.floor(scrollTop / itemHeight);
      const visibleEnd = Math.min(
        items.length - 1,
        Math.ceil((scrollTop + containerHeight) / itemHeight)
      );

      const start = Math.max(0, visibleStart - overscan);
      const end = Math.min(items.length - 1, visibleEnd + overscan);

      return { start, end };
    }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

    const visibleItems = useMemo(() => {
      const result = [];
      for (let i = visibleRange.start; i <= visibleRange.end; i++) {
        result.push({
          index: i,
          item: items[i],
          top: i * itemHeight,
        });
      }
      return result;
    }, [items, visibleRange.start, visibleRange.end, itemHeight]);

    const totalHeight = items.length * itemHeight;

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop((e.target as HTMLDivElement).scrollTop);
    };

    return (
      <div
        className={`overflow-auto ${className}`}
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          {visibleItems.map(({ index, item, top }) => (
            <div
              key={index}
              style={{
                position: "absolute",
                top,
                left: 0,
                right: 0,
                height: itemHeight,
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

export { VirtualList };
