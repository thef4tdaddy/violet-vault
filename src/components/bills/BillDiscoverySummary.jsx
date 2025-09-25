import React from "react";

/**
 * Summary bar for BillDiscoveryModal
 * Shows selection counts and estimated totals
 */
const BillDiscoverySummary = ({
  selectedBillsCount,
  totalBillsCount,
  estimatedTotal,
  onSelectAll,
  onClearAll,
}) => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm text-blue-700">
            <span className="font-medium">{selectedBillsCount}</span> of{" "}
            <span className="font-medium">{totalBillsCount}</span> bills
            selected
          </div>
          <div className="text-sm text-blue-600">
            Total estimated monthly: ${estimatedTotal.toFixed(2)}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Select All
          </button>
          <button
            onClick={onClearAll}
            className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillDiscoverySummary;