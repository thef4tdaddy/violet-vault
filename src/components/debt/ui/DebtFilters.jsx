import React, { useState } from "react";
import { Filter, ChevronDown, ChevronUp } from "lucide-react";
import { DEBT_TYPE_CONFIG } from "../../../constants/debts";

/**
 * Debt filtering and sorting controls
 * Pure UI component for debt list filtering
 */
const DebtFilters = ({
  filterOptions,
  setFilterOptions,
  debtTypes,
  debtsByType,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (field, value) => {
    setFilterOptions((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Check if any filters are active
  const hasActiveFilters =
    filterOptions.type !== "all" ||
    filterOptions.status !== "all" ||
    filterOptions.sortBy !== "balance_desc" ||
    filterOptions.showPaidOff;

  return (
    <div className="glassmorphism rounded-xl border border-white/20">
      {/* Header - Always Visible */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            Filters & Sorting
          </span>
          {hasActiveFilters && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Active
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-lg hover:bg-white/50 transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Debt Type
              </label>
              <select
                value={filterOptions.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="glassmorphism w-full px-3 py-2 border border-white/20 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Types</option>
                {Object.values(debtTypes).map((type) => {
                  const config = DEBT_TYPE_CONFIG[type];
                  const count = debtsByType[type]?.length || 0;
                  return (
                    <option key={type} value={type}>
                      {config?.name || type} {count > 0 && `(${count})`}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterOptions.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="glassmorphism w-full px-3 py-2 border border-white/20 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paid_off">Paid Off</option>
                <option value="deferred">Deferred</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filterOptions.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="glassmorphism w-full px-3 py-2 border border-white/20 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="balance_desc">Highest Balance</option>
                <option value="balance_asc">Lowest Balance</option>
                <option value="payment_desc">Highest Payment</option>
                <option value="rate_desc">Highest Interest Rate</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options
              </label>
              <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
                <input
                  type="checkbox"
                  id="showPaidOff"
                  checked={filterOptions.showPaidOff}
                  onChange={(e) =>
                    handleFilterChange("showPaidOff", e.target.checked)
                  }
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                />
                <label
                  htmlFor="showPaidOff"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  Show Paid Off
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtFilters;
