import React from "react";

/**
 * Props for the export progress indicator component
 */
interface ExportProgressIndicatorProps {
  isExporting: boolean;
  progress: number;
}

/**
 * Export progress indicator component
 * Shows export progress with visual progress bar
 * Extracted from ReportExporter.tsx for reusability
 */
export const ExportProgressIndicator: React.FC<ExportProgressIndicatorProps> = ({
  isExporting,
  progress,
}) => {
  if (!isExporting) return null;

  return (
    <div className="flex items-center">
      <div className="flex items-center mr-4">
        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm text-gray-600">{progress}%</span>
      </div>
    </div>
  );
};
