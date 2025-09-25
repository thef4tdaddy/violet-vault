import React from "react";
import { getIcon } from "../../../utils";

/**
 * ReportFormatSelector - Export format selection component
 * Extracted from ReportExporter.jsx for better component organization
 */
const ReportFormatSelector = ({ exportFormat, setExportFormat }) => {
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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Export Format
      </h3>
      <div className="space-y-3">
        {exportFormats.map((format) => (
          <div
            key={format.key}
            className={`relative border-2 border-black rounded-lg p-4 cursor-pointer transition-all ${
              exportFormat === format.key
                ? "bg-blue-50 ring-1 ring-blue-500"
                : "hover:bg-gray-50"
            }`}
            onClick={() => setExportFormat(format.key)}
          >
            {format.recommended && (
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Recommended
              </span>
            )}
            <div className="flex items-start">
              {React.createElement(getIcon(format.icon), {
                className:
                  "h-6 w-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0",
              })}
              <div>
                <h4 className="font-medium text-gray-900">
                  {format.label}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {format.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportFormatSelector;