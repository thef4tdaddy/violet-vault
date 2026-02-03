/**
 * Chart Export Button Component
 * Created for Phase 2.4: Enhanced Chart Components (Tier 2)
 *
 * Exports chart as PNG image using html-to-image library
 */

import React, { useState } from "react";
import Button from "@/components/ui/buttons/Button";
import { getIcon } from "@/utils";
import logger from "@/utils/core/common/logger";

export interface ChartExportButtonProps {
  chartRef: React.RefObject<HTMLDivElement | null>;
  filename: string;
  className?: string;
}

/**
 * ChartExportButton Component
 *
 * Provides PNG export functionality for chart visualizations
 *
 * @example
 * ```tsx
 * const chartRef = useRef<HTMLDivElement>(null);
 *
 * return (
 *   <div>
 *     <div ref={chartRef}>
 *       <LineChart data={data} />
 *     </div>
 *     <ChartExportButton chartRef={chartRef} filename="allocation-trends" />
 *   </div>
 * );
 * ```
 */
export const ChartExportButton: React.FC<ChartExportButtonProps> = ({
  chartRef,
  filename,
  className = "",
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const DownloadIcon = getIcon("Download");

  const handleExport = async () => {
    if (!chartRef.current) {
      logger.error("ChartExportButton: Chart ref is not available");
      return;
    }

    setIsExporting(true);

    try {
      // Dynamically import html-to-image to keep bundle size small
      const { toPng } = await import("html-to-image");

      // Convert chart to PNG
      const dataUrl = await toPng(chartRef.current, {
        quality: 1.0,
        pixelRatio: 2, // Higher quality for retina displays
      });

      // Create download link
      const link = document.createElement("a");
      link.download = `${filename}-${new Date().toISOString().split("T")[0]}.png`;
      link.href = dataUrl;
      link.click();

      logger.info("Chart exported successfully", { filename });
    } catch (error) {
      logger.error("Failed to export chart", { error, filename });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
      loading={isExporting}
      icon={<DownloadIcon className="h-4 w-4" />}
      className={className}
    >
      {isExporting ? "Exporting..." : "Export PNG"}
    </Button>
  );
};

export default ChartExportButton;
