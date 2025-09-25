import React from "react";
import { getIcon } from "../../../../utils";

/**
 * LocalOnlyImportStep - File import functionality step
 * Extracted from LocalOnlySetup.jsx to reduce component complexity
 */
const LocalOnlyImportStep = ({
  importFile,
  setImportFile,
  onBack,
  onImportAndStart,
  loading,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Import Previous Data
        </h3>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
          {React.createElement(getIcon("Upload"), {
            className: "h-8 w-8 text-gray-400 mx-auto mb-3",
          })}
          <div className="text-sm text-gray-600 mb-3">
            Select a previously exported VioletVault local-only backup file
          </div>
          <input
            type="file"
            accept=".json"
            onChange={(e) => setImportFile(e.target.files[0])}
            className="hidden"
            id="importFile"
          />
          <label
            htmlFor="importFile"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer border-2 border-black"
          >
            Select File
          </label>
          {importFile && (
            <div className="mt-3 text-sm text-green-600">
              ✓ {importFile.name} selected
            </div>
          )}
        </div>

        {importFile && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Import Process</p>
              <p>
                This will restore your envelopes, transactions, and settings from
                the backup file. Your existing local data (if any) will be replaced.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border-2 border-black"
        >
          Back
        </button>
        <button
          onClick={onImportAndStart}
          disabled={loading || !importFile}
          className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 border-2 border-black"
        >
          {loading ? "Importing..." : "Import & Start"}
        </button>
      </div>
    </div>
  );
};

export default LocalOnlyImportStep;