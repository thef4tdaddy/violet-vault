import React from "react";
import { getIcon } from "../../../utils";

/**
 * Data management section for Local-Only Mode Settings
 * Extracted from LocalOnlyModeSettings.jsx following refactoring pattern
 * 
 * Features:
 * - Export data functionality
 * - Import data with file input
 * - Consistent button styling with borders
 * - Loading state handling
 */
const LocalOnlyDataManagement = ({ 
  handleExportData, 
  handleImportData, 
  fileInputRef, 
  loading 
}) => {
  return (
    <div className="glassmorphism rounded-xl p-6 border-2 border-black bg-white/90 backdrop-blur-sm shadow-xl mb-6">
      <h4 className="font-black text-black text-base mb-4">
        <span className="text-lg">D</span>ATA MANAGEMENT
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Data */}
        <button
          onClick={handleExportData}
          disabled={loading}
          className="glassmorphism rounded-xl p-6 border-2 border-black bg-green-100/40 backdrop-blur-sm hover:bg-green-200/60 transition-all disabled:opacity-50 text-left shadow-lg hover:shadow-xl group"
        >
          <div className="flex items-center mb-3">
            {React.createElement(getIcon("Download"), {
              className: "h-8 w-8 text-green-600 mr-3 group-hover:scale-110 transition-transform",
            })}
            <div className="font-black text-green-900 text-base">
              <span className="text-lg">E</span>XPORT DATA
            </div>
          </div>
          <div className="text-sm text-green-700 font-medium">
            Download all your budget data as a backup file
          </div>
        </button>

        {/* Import Data */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="glassmorphism rounded-xl p-6 border-2 border-black bg-blue-100/40 backdrop-blur-sm hover:bg-blue-200/60 transition-all disabled:opacity-50 text-left shadow-lg hover:shadow-xl group"
        >
          <div className="flex items-center mb-3">
            {React.createElement(getIcon("Upload"), {
              className: "h-8 w-8 text-blue-600 mr-3 group-hover:scale-110 transition-transform",
            })}
            <div className="font-black text-blue-900 text-base">
              <span className="text-lg">I</span>MPORT DATA
            </div>
          </div>
          <div className="text-sm text-blue-700 font-medium">
            Restore data from a previous export file
          </div>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportData}
          className="hidden"
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default LocalOnlyDataManagement;