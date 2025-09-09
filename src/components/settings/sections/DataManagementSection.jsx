/* eslint-disable no-console */
import React from "react";
import { AlertTriangle, History, Download, Upload, Cloud, Activity, RefreshCw, Wrench } from "lucide-react";
import { getLocalOnlyMode } from "../../../utils/settings/settingsHelpers";

const DataManagementSection = ({
  onOpenEnvelopeChecker,
  onOpenActivityFeed,
  onCreateTestHistory,
  onExport,
  onImport,
  onSync,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>

      <div className="space-y-4">
        <button
          onClick={onOpenEnvelopeChecker}
          className="w-full flex items-center p-3 border border-purple-200 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <AlertTriangle className="h-5 w-5 text-purple-600 mr-3" />
          <div className="text-left">
            <p className="font-medium text-purple-900">Envelope Integrity Checker</p>
            <p className="text-sm text-purple-700">Detect and fix empty/corrupted envelopes</p>
          </div>
        </button>

        <button
          onClick={onOpenActivityFeed}
          className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <History className="h-5 w-5 text-gray-600 mr-3" />
          <div className="text-left">
            <p className="font-medium text-gray-900">Activity History</p>
            <p className="text-sm text-gray-500">View recent budget activities and changes</p>
          </div>
        </button>

        <button
          onClick={onCreateTestHistory}
          className="w-full flex items-center p-3 border border-yellow-200 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
        >
          <History className="h-5 w-5 text-yellow-600 mr-3" />
          <div className="text-left">
            <p className="font-medium text-yellow-900">🧪 Test Budget History</p>
            <p className="text-sm text-yellow-700">Create test commits for family collaboration</p>
          </div>
        </button>

        <button
          onClick={onExport}
          className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="h-5 w-5 text-gray-600 mr-3" />
          <div className="text-left">
            <p className="font-medium text-gray-900">Export Data</p>
            <p className="text-sm text-gray-500">Download your budget data</p>
          </div>
        </button>

        <div className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
          <input
            type="file"
            accept=".json"
            onChange={onImport}
            className="hidden"
            id="settings-import-data"
          />
          <label htmlFor="settings-import-data" className="w-full flex items-center cursor-pointer">
            <Upload className="h-5 w-5 text-gray-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Import Data</p>
              <p className="text-sm text-gray-500">Upload budget data from file</p>
            </div>
          </label>
        </div>

        {getLocalOnlyMode() && (
          <button
            onClick={onSync}
            className="w-full flex items-center p-3 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Cloud className="h-5 w-5 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-blue-900">Sync to Cloud</p>
              <p className="text-sm text-blue-600">Upload your data to cloud storage</p>
            </div>
          </button>
        )}

        {/* Sync Health Tools */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Sync Health Tools
          </h4>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                console.log("🔄 Settings: Refresh Sync Status clicked");
                if (window.getQuickSyncStatus) {
                  window.getQuickSyncStatus().then(result => console.log("🔄 Result:", result));
                } else {
                  console.log("🔄 ERROR: window.getQuickSyncStatus not found");
                }
              }}
              className="w-full flex items-center p-3 border border-green-200 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <RefreshCw className="h-4 w-4 text-green-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-green-900">Refresh Sync Status</p>
                <p className="text-xs text-green-700">Check current sync health</p>
              </div>
            </button>

            <button
              onClick={() => {
                console.log("🚀 Settings: Run Full Validation clicked");
                if (window.runMasterSyncValidation) {
                  window.runMasterSyncValidation().then(result => console.log("🚀 Result:", result));
                } else {
                  console.log("🚀 ERROR: window.runMasterSyncValidation not found");
                }
              }}
              className="w-full flex items-center p-3 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Wrench className="h-4 w-4 text-blue-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-blue-900">Run Full Sync Validation</p>
                <p className="text-xs text-blue-700">Comprehensive sync system check</p>
              </div>
            </button>

            <button
              onClick={() => {
                console.log("🧹 Settings: Reset Cloud Data clicked");
                if (window.forceCloudDataReset) {
                  // eslint-disable-next-line no-restricted-globals
                  if (confirm("⚠️ Reset Cloud Data?\n\nThis will:\n• Clear all cloud data\n• Re-upload from local storage\n• Cannot be undone\n\nContinue?")) {
                    window.forceCloudDataReset().then(result => console.log("🧹 Result:", result));
                  }
                } else {
                  console.log("🧹 ERROR: window.forceCloudDataReset not found");
                }
              }}
              className="w-full flex items-center p-3 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <AlertTriangle className="h-4 w-4 text-red-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-red-900">🚨 Reset Cloud Data</p>
                <p className="text-xs text-red-700">Emergency recovery: clear and re-upload</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagementSection;
