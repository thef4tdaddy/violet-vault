import React, { useState } from "react";
import { renderIcon } from "../../../utils/icons";

const FileUploader = ({ onFileUpload }) => {
  const [clearExisting, setClearExisting] = useState(false);
  return (
    <div className="space-y-6">
      <div className="text-center">
        {renderIcon("Upload", { className: "mx-auto h-12 w-12 text-gray-400" })}
        <h4 className="mt-4 text-lg font-medium text-gray-900">Upload Transaction File</h4>
        <p className="mt-2 text-sm text-gray-600">Support for CSV and OFX files from your bank</p>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <input
            type="file"
            accept=".csv,.ofx"
            onChange={(e) => onFileUpload(e, { clearExisting })}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer block text-center">
            {renderIcon("FileText", { className: "mx-auto h-12 w-12 text-gray-400" })}
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Click to upload or drag and drop
            </span>
            <span className="block text-sm text-gray-600">CSV or OFX files only</span>
          </label>
        </div>

        <div className="glassmorphism rounded-lg p-4 border border-white/20">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={clearExisting}
              onChange={(e) => setClearExisting(e.target.checked)}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
            />
            <div className="flex items-center space-x-2">
              {renderIcon("Trash2", { className: "h-4 w-4 text-red-500" })}
              <span className="text-sm font-medium text-gray-900">
                Clear existing transactions and paychecks before import
              </span>
            </div>
          </label>
          <p className="ml-7 mt-1 text-xs text-red-600">
            Warning: This will permanently delete all existing transaction history and paycheck
            records
          </p>
        </div>
      </div>

      <div className="glassmorphism rounded-lg p-4 border border-white/20">
        <div className="flex">
          {renderIcon("AlertCircle", { className: "h-5 w-5 text-blue-400" })}
          <div className="ml-3">
            <h5 className="text-sm font-medium text-blue-800">Supported File Formats</h5>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>CSV:</strong> Exported from banks like Chase, Wells Fargo, etc.
                </li>
                <li>
                  <strong>OFX:</strong> Open Financial Exchange format
                </li>
                <li>Files should include Date, Description, and Amount columns</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
