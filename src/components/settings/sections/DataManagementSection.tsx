import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";
import { getLocalOnlyMode } from "@/utils/settings/settingsHelpers";

interface DataManagementSectionProps {
  onOpenActivityFeed: () => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSync: () => void;
}

const DataManagementSection: React.FC<DataManagementSectionProps> = ({
  onOpenActivityFeed,
  onExport,
  onImport,
  onSync,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>

      <div className="space-y-4">
        <Button
          onClick={onOpenActivityFeed}
          className="w-full flex items-center p-3 border-2 border-black bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors shadow-sm"
        >
          {React.createElement(getIcon("History"), {
            className: "h-5 w-5 text-purple-600 mr-3",
          })}
          <div className="text-left">
            <p className="font-medium text-gray-900">Activity History</p>
            <p className="text-sm text-gray-700">View recent budget activities and changes</p>
          </div>
        </Button>

        <Button
          onClick={onExport}
          className="w-full flex items-center p-3 border-2 border-black bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
        >
          {React.createElement(getIcon("Download"), {
            className: "h-5 w-5 text-blue-600 mr-3",
          })}
          <div className="text-left">
            <p className="font-medium text-gray-900">Export Data</p>
            <p className="text-sm text-gray-700">Download your budget data</p>
          </div>
        </Button>

        <div className="border-2 border-black bg-green-50 rounded-lg p-3 hover:bg-green-100 transition-colors shadow-sm">
          <input
            type="file"
            accept=".json"
            onChange={onImport}
            className="hidden"
            id="settings-import-data"
          />
          <label
            htmlFor="settings-import-data"
            className="w-full flex items-center justify-center cursor-pointer"
          >
            {React.createElement(getIcon("Upload"), {
              className: "h-5 w-5 text-green-600 mr-3",
            })}
            <div className="text-center">
              <p className="font-medium text-gray-900">Import Data</p>
              <p className="text-sm text-gray-700">Upload budget data from file</p>
            </div>
          </label>
        </div>

        {getLocalOnlyMode() && (
          <Button
            onClick={onSync}
            className="w-full flex items-center p-3 border-2 border-black bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
          >
            {React.createElement(getIcon("Cloud"), {
              className: "h-5 w-5 text-blue-600 mr-3",
            })}
            <div className="text-left">
              <p className="font-medium text-gray-900">Sync to Cloud</p>
              <p className="text-sm text-gray-700">Upload your data to cloud storage</p>
            </div>
          </Button>
        )}

        {/* Note: Sync debug tools moved to Dev Tools section to avoid duplication */}
      </div>
    </div>
  );
};

export default DataManagementSection;
