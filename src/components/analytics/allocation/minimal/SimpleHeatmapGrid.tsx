import React, { useState } from "react";

export interface HeatmapDataPoint {
  date: string; // ISO date string
  amount: number;
  intensity: number; // 0-100
}

export interface SimpleHeatmapGridProps {
  data: HeatmapDataPoint[];
  loading?: boolean;
  title?: string;
}

/**
 * Simple Heatmap Grid Component
 *
 * CSS Grid-based calendar heatmap showing allocation intensity.
 * Pure CSS implementation with no external dependencies.
 *
 * Features:
 * - 7 columns × 5 rows grid (35 days)
 * - Intensity displayed via opacity
 * - Hover tooltip with date and amount
 * - Fully offline, no color libraries
 * - Responsive design
 *
 * Target: ~4KB
 *
 * @example
 * ```tsx
 * <SimpleHeatmapGrid
 *   data={[
 *     { date: "2024-01-01", amount: 100, intensity: 75 },
 *     { date: "2024-01-02", amount: 50, intensity: 40 }
 *   ]}
 * />
 * ```
 */
export const SimpleHeatmapGrid: React.FC<SimpleHeatmapGridProps> = ({
  data,
  loading = false,
  title = "Activity Heatmap",
}) => {
  const [hoveredCell, setHoveredCell] = useState<HeatmapDataPoint | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Generate 35 cells (7 cols × 5 rows)
  const generateCells = (): (HeatmapDataPoint | null)[] => {
    const cells: (HeatmapDataPoint | null)[] = [];
    const today = new Date();

    for (let i = 34; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dataPoint = data.find((d) => d.date === dateStr);
      cells.push(dataPoint || null);
    }

    return cells;
  };

  const cells = generateCells();

  // Format date for tooltip
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Handle cell hover
  const handleCellHover = (
    cell: HeatmapDataPoint | null,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (cell) {
      setHoveredCell(cell);
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    } else {
      setHoveredCell(null);
    }
  };

  // Get cell color based on intensity
  const getCellStyle = (cell: HeatmapDataPoint | null): React.CSSProperties => {
    if (!cell) {
      return { backgroundColor: "#f3f4f6", opacity: 0.3 };
    }

    // Base color: purple
    // Intensity determines opacity (0-100 -> 0.2-1.0)
    const opacity = 0.2 + (cell.intensity / 100) * 0.8;

    return {
      backgroundColor: "#8b5cf6", // purple-500
      opacity,
    };
  };

  if (loading) {
    return (
      <div
        className="bg-white rounded-2xl p-6 hard-border"
        role="region"
        aria-label="Heatmap Loading"
        data-testid="heatmap-loading"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-2xl p-6 hard-border"
      role="region"
      aria-label="Activity Heatmap"
      data-testid="simple-heatmap-grid"
    >
      {/* Title */}
      <h3 className="text-lg font-black text-gray-900 mb-4">{title}</h3>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-xs font-bold text-gray-500 text-center" aria-label={day}>
            {day}
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell, index) => (
          <div
            key={index}
            className="aspect-square rounded transition-all duration-200 hover:scale-110 cursor-pointer"
            style={getCellStyle(cell)}
            onMouseEnter={(e) => handleCellHover(cell, e)}
            onMouseLeave={() => setHoveredCell(null)}
            role="gridcell"
            aria-label={
              cell ? `${formatDate(cell.date)}: ${formatCurrency(cell.amount)}` : "No activity"
            }
            data-testid={`heatmap-cell-${index}`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <span className="text-xs font-bold text-gray-500">Less</span>
        {[20, 40, 60, 80, 100].map((intensity) => (
          <div
            key={intensity}
            className="w-4 h-4 rounded"
            style={{
              backgroundColor: "#8b5cf6",
              opacity: 0.2 + (intensity / 100) * 0.8,
            }}
            aria-hidden="true"
          />
        ))}
        <span className="text-xs font-bold text-gray-500">More</span>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm pointer-events-none shadow-lg"
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y + 10}px`,
          }}
          role="tooltip"
          data-testid="heatmap-tooltip"
        >
          <div className="font-bold">{formatDate(hoveredCell.date)}</div>
          <div className="text-gray-300">{formatCurrency(hoveredCell.amount)}</div>
        </div>
      )}
    </div>
  );
};

export default SimpleHeatmapGrid;
