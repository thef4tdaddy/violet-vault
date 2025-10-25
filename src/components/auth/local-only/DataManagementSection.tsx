import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";

interface DataManagementSectionProps {
  loading: boolean;
  onExportData: () => void;
  onImportClick: () => void;
}

const DataManagementSection: React.FC<DataManagementSectionProps> = ({
  loading,
  onExportData,
  onImportClick,
}) => {
  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-4">Data Management</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Data */}
        <Button
          onClick={onExportData}
          disabled={loading}
          className="p-4 border border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors disabled:opacity-50 text-left"
        >
          {React.createElement(getIcon("Download"), {
            className: "h-6 w-6 text-green-600 mb-2",
          })}
          <div className="font-medium text-gray-900">Export Data</div>
          <div className="text-sm text-gray-600">
            Download all your budget data as a backup file
          </div>
        </Button>

        {/* Import Data */}
        <Button
          onClick={onImportClick}
          disabled={loading}
          className="p-4 border border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 text-left"
        >
          {React.createElement(getIcon("Upload"), {
            className: "h-6 w-6 text-blue-600 mb-2",
          })}
          <div className="font-medium text-gray-900">Import Data</div>
          <div className="text-sm text-gray-600">Restore data from a previous export file</div>
        </Button>
      </div>
    </div>
  );
};

export default DataManagementSection;
