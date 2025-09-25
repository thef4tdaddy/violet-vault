import React from "react";
import { getIcon } from "../../../utils";

/**
 * ReportExportHeader - Header component for the ReportExporter modal
 * Extracted from ReportExporter.jsx for better component organization
 */
const ReportExportHeader = ({ onClose, isExporting }) => {
  return (
    <div className="flex items-center justify-between p-6 border-b">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          {React.createElement(getIcon("Download"), {
            className: "h-6 w-6 mr-3 text-blue-600",
          })}
          Export Report
        </h2>
        <p className="text-gray-600 mt-1">
          Generate comprehensive analytics reports
        </p>
      </div>
      <button
        onClick={onClose}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
        disabled={isExporting}
      >
        {React.createElement(getIcon("X"), {
          className: "h-5 w-5",
        })}
      </button>
    </div>
  );
};

export default ReportExportHeader;