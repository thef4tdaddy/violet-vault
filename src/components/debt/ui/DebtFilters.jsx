import React from "react";
import { Filter } from "lucide-react";
import { DEBT_TYPE_CONFIG } from "../../../constants/debts";

/**
 * Debt filtering and sorting controls
 * Pure UI component for debt list filtering
 */
const DebtFilters = ({ filterOptions, setFilterOptions, debtTypes, debtsByType }) => {
  const handleFilterChange = (field, value) => {
    setFilterOptions((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-white/20">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h4 className="font-medium text-gray-900 flex items-center text-sm">
          <Filter className="h-4 w-4 mr-2" />
          Filters & Sorting
        </h4>

        <div className="flex flex-wrap gap-3">
          {/* Debt Type Filter */}
          <select
            value={filterOptions.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
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

          {/* Status Filter */}
          <select
            value={filterOptions.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paid_off">Paid Off</option>
            <option value="deferred">Deferred</option>
          </select>

          {/* Sort By */}
          <select
            value={filterOptions.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="balance_desc">Highest Balance</option>
            <option value="balance_asc">Lowest Balance</option>
            <option value="payment_desc">Highest Payment</option>
            <option value="rate_desc">Highest Interest Rate</option>
            <option value="name">Name A-Z</option>
          </select>

          {/* Show Paid Off Toggle */}
          <label className="flex items-center text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={filterOptions.showPaidOff}
              onChange={(e) => handleFilterChange("showPaidOff", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
            />
            Show Paid Off
          </label>
        </div>
      </div>
    </div>
  );
};

export default DebtFilters;
