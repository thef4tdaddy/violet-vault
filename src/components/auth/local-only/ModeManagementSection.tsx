import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";

interface ModeManagementSectionProps {
  loading: boolean;
  onSwitchMode: () => void;
  onClearData: () => void;
}

const ModeManagementSection: React.FC<ModeManagementSectionProps> = ({
  loading,
  onSwitchMode,
  onClearData,
}) => {
  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-4">Mode Management</h4>
      <div className="space-y-4">
        {/* Switch to Standard Mode */}
        <div className="border border-purple-300 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                {React.createElement(getIcon("LogOut"), {
                  className: "h-5 w-5 text-purple-600 mr-2",
                })}
                <h5 className="font-medium text-gray-900">Switch to Standard Mode</h5>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Enable password protection and cloud sync features. Your local data will be
                preserved.
              </p>
            </div>
            <Button
              onClick={onSwitchMode}
              disabled={loading}
              className="ml-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              Switch Mode
            </Button>
          </div>
        </div>

        {/* Clear All Data */}
        <div className="border border-red-300 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                {React.createElement(getIcon("Trash2"), {
                  className: "h-5 w-5 text-red-600 mr-2",
                })}
                <h5 className="font-medium text-gray-900">Clear All Data</h5>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Permanently delete all envelopes, transactions, and settings. This cannot be undone.
              </p>
            </div>
            <Button
              onClick={onClearData}
              disabled={loading}
              className="ml-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Clear Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeManagementSection;
