import React from "react";
import { getIcon } from "../../utils";

/**
 * Action buttons section for BillDiscoveryModal
 * Extracted component with consistent button styling
 */
const BillDiscoveryActions = ({
  selectedBillsCount,
  isProcessing,
  onClose,
  onAddSelected,
}) => {
  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Selected bills will be added to your bill tracker
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 border-2 border-black rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onAddSelected}
            disabled={selectedBillsCount === 0 || isProcessing}
            className="px-4 py-2 bg-blue-600 text-white border-2 border-black rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
          >
            {isProcessing ? (
              <>
                {React.createElement(getIcon("Clock"), {
                  className: "h-4 w-4 mr-2 animate-spin",
                })}
                Adding...
              </>
            ) : (
              <>
                {React.createElement(getIcon("Plus"), {
                  className: "h-4 w-4 mr-2",
                })}
                Add {selectedBillsCount} Bills
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillDiscoveryActions;