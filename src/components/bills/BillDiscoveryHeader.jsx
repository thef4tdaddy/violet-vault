import React from "react";
import { getIcon } from "../../utils";

/**
 * Header section for BillDiscoveryModal
 * Extracted component following BillModalHeader pattern
 */
const BillDiscoveryHeader = ({ 
  onClose, 
  discoveredBillsCount 
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center">
          {React.createElement(getIcon("Search"), {
            className: "h-5 w-5 mr-2 text-blue-600",
          })}
          Discovered Bills
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Found {discoveredBillsCount} potential recurring bills from your transaction
          history
        </p>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600"
      >
        {React.createElement(getIcon("X"), { className: "h-5 w-5" })}
      </button>
    </div>
  );
};

export default BillDiscoveryHeader;