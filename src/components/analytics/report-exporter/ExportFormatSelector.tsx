import React from "react";
import { getIcon } from "@/utils";

/**
 * Props for the export format selector component
 */
interface ExportFormatSelectorProps {
  exportFormat: string;
  onFormatChange: (format: string) => void;
  disabled?: boolean;
}

/**
 * Export format selector component
 * Displays available export formats with descriptions and recommendations
 * Extracted from ReportExporter.tsx for reusability
 */
export const ExportFormatSelector: React.FC<ExportFormatSelectorProps> = ({
  exportFormat,
  onFormatChange,
  disabled = false,
}) => {
  const exportFormats = [
    {
      key: "pdf",
      label: "PDF Report",
      icon: "FileText",
      description: "Comprehensive report with charts and analysis",
      recommended: true,
    },
    {
      key: "csv",
      label: "CSV Data",
      icon: "Table",
      description: "Raw data export for spreadsheet analysis",
    },
    {
      key: "png",
      label: "Chart Images",
      icon: "Image",
      description: "Export charts as PNG images",
    },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Format</h3>
      <div className="space-y-3">
        {exportFormats.map((format) => (
          <div
            key={format.key}
            className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
              exportFormat === format.key
                ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                : "border-gray-200 hover:border-gray-300"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => !disabled && onFormatChange(format.key)}
          >
            {format.recommended && (
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Recommended
              </span>
            )}
            <div className="flex items-start">
              {React.createElement(getIcon(format.icon), {
                className: "h-6 w-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0",
              })}
              <div>
                <h4 className="font-medium text-gray-900">{format.label}</h4>
                <p className="text-sm text-gray-600 mt-1">{format.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
