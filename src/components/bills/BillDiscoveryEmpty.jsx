import React from "react";
import { getIcon } from "../../utils";

/**
 * Empty state component for when no bills are discovered
 * Extracted from BillDiscoveryModal
 */
const BillDiscoveryEmpty = () => {
  return (
    <div className="text-center py-12 text-gray-500">
      {React.createElement(getIcon("Search"), {
        className: "h-12 w-12 mx-auto mb-3 opacity-50",
      })}
      <p className="font-medium">No new bills discovered</p>
      <p className="text-sm mt-1">
        Try adding more transaction history or check back later as you make
        more purchases.
      </p>
    </div>
  );
};

export default BillDiscoveryEmpty;