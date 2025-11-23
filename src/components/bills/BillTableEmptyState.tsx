import React from "react";
import { getIcon } from "../../utils";
import type { Bill } from "@/types/bills";

interface BillTableEmptyStateProps {
  viewMode: string;
  filteredBills: Bill[];
  categorizedBills: Record<string, Bill[]>;
}

/**
 * Empty state component for BillTable
 * Extracted to reduce BillTable complexity
 */
const BillTableEmptyState = ({ viewMode, filteredBills, categorizedBills }: BillTableEmptyStateProps) => {
  const isDev = import.meta.env.MODE === "development";

  return (
    <div className="text-center py-12 text-gray-500">
      {React.createElement(getIcon("FileText"), {
        className: "mx-auto h-12 w-12 text-gray-400",
      })}
      <h3 className="mt-2 text-sm font-medium text-gray-900">No bills found</h3>
      <p className="mt-1 text-sm text-gray-500">
        {viewMode === "all"
          ? "Get started by adding a new bill."
          : "Try switching to a different view or adjusting filters."}
      </p>
      {isDev && (
        <div className="mt-4 text-xs text-gray-400 font-mono">
          DEBUG: Bills={filteredBills.length}, Categorized=
          {JSON.stringify(
            Object.keys(categorizedBills).map((k) => `${k}:${categorizedBills[k]?.length || 0}`)
          )}
          , ViewMode={viewMode}
        </div>
      )}
    </div>
  );
};

export default BillTableEmptyState;
