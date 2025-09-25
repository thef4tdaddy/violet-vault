import React from "react";
import { getIcon } from "../../../utils";

/**
 * ReportExportFooter - Footer with progress and action buttons
 * Extracted from ReportExporter.jsx for better component organization
 */
const ReportExportFooter = ({
  exportFormat,
  isExporting,
  exportProgress,
  onExport,
  onClose,
}) => {
  return (
    <div className="flex items-center justify-between p-6 border-t bg-gray-50">
      <div className="flex items-center text-sm text-gray-600">
        {React.createElement(getIcon("FileText"), {
          className: "h-4 w-4 mr-2",
        })}
        {exportFormat.toUpperCase()} export selected
      </div>

      {isExporting && (
        <div className="flex items-center">
          <div className="flex items-center mr-4">
            <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">{exportProgress}%</span>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium border-2 border-black bg-white hover:bg-gray-50 rounded-lg"
          disabled={isExporting}
        >
          Cancel
        </button>
        <button
          onClick={onExport}
          disabled={isExporting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center border-2 border-black"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Exporting...
            </>
          ) : (
            <>
              {React.createElement(getIcon("Download"), {
                className: "h-4 w-4 mr-2",
              })}
              Export Report
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReportExportFooter;