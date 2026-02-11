import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";

interface Summary {
  hasChanges: boolean;
  changedBills: number;
  totalAmountChange: number;
}

interface BulkUpdateSummaryProps {
  summary: Summary;
  onClose: () => void;
  handleSubmit: () => void;
}

/**
 * Summary and action buttons for BulkBillUpdateModal
 * Extracted to reduce complexity
 */
const BulkUpdateSummary: React.FC<BulkUpdateSummaryProps> = ({
  summary,
  onClose,
  handleSubmit,
}) => {
  return (
    <div className="mt-6 pt-4 border-t-2 border-black">
      <div className="flex items-center justify-between">
        <div className="text-sm text-purple-800">
          {summary.hasChanges ? (
            <div className="flex items-center gap-2 glassmorphism backdrop-blur-sm px-3 py-2 rounded-lg border border-orange-200">
              {React.createElement(getIcon("AlertTriangle"), {
                className: "h-4 w-4 text-orange-600",
              })}
              <span className="font-bold">
                {summary.changedBills} bills have changes
                {summary.totalAmountChange !== 0 && (
                  <span className="ml-2 text-purple-900">
                    (Net: {summary.totalAmountChange > 0 ? "+" : ""}$
                    {summary.totalAmountChange.toFixed(2)})
                  </span>
                )}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 glassmorphism backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-200">
              {React.createElement(getIcon("Clock"), {
                className: "h-4 w-4 text-gray-500",
              })}
              <span className="font-medium text-gray-600">No changes made yet</span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            className="px-4 py-2 text-gray-800 bg-gray-200/80 rounded-lg hover:bg-gray-300/80 transition-all border-2 border-black shadow-md hover:shadow-lg font-bold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!summary.hasChanges}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all border-2 border-black shadow-md hover:shadow-lg font-black"
          >
            Update {summary.changedBills} Bills
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkUpdateSummary;
