import React, { useState } from "react";
import { Select, Checkbox } from "@/components/ui";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils/icons";

export interface FilterConfig {
  key: string;
  label?: string;
  type: "select" | "checkbox";
  options?: Array<{ value: string; label: string }>;
  defaultValue?: string | boolean;
}

interface FilterValues {
  search?: string;
  [key: string]: string | boolean | undefined;
}

interface CollapsibleHeaderProps {
  isExpanded: boolean;
  onToggle: () => void;
  hasActiveFilters: boolean;
  filtersEnabled: boolean;
  onToggleFilters: () => void;
}

/**
 * Collapsible filter header with toggle and clear button
 */
const CollapsibleFilterHeader = ({
  isExpanded,
  onToggle,
  hasActiveFilters,
  filtersEnabled,
  onToggleFilters,
}: CollapsibleHeaderProps) => {
  return (
    <div
      className={`flex items-center justify-between p-4 ${!isExpanded ? "cursor-pointer hover:bg-gray-50" : ""}`}
      onClick={!isExpanded ? onToggle : undefined}
    >
      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
        {React.createElement(getIcon("Filter"), {
          className: `h-4 w-4 ${filtersEnabled ? "text-purple-600" : "text-gray-400"}`,
        })}
        <span
          className={`text-sm font-medium ${filtersEnabled ? "text-purple-900" : "text-gray-500"}`}
        >
          Filters & Sorting
        </span>

        {/* Active badge - clickable to toggle filters */}
        {hasActiveFilters && filtersEnabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFilters();
            }}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-200 text-purple-900 hover:bg-purple-300 transition-colors border border-purple-300 cursor-pointer"
            title="Click to disable all filters"
          >
            Active
          </button>
        )}

        {/* Disabled indicator */}
        {!filtersEnabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFilters();
            }}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors border border-gray-300 cursor-pointer"
            title="Click to enable filters"
          >
            Disabled
          </button>
        )}
      </div>

      <Button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={`p-1 rounded-lg transition-colors ${
          filtersEnabled ? "bg-purple-100 hover:bg-purple-200" : "bg-gray-100 hover:bg-gray-200"
        }`}
      >
        {isExpanded
          ? React.createElement(getIcon("ChevronUp"), {
              className: `h-4 w-4 ${filtersEnabled ? "text-purple-600" : "text-gray-400"}`,
            })
          : React.createElement(getIcon("ChevronDown"), {
              className: `h-4 w-4 ${filtersEnabled ? "text-purple-600" : "text-gray-400"}`,
            })}
      </Button>
    </div>
  );
};

interface CollapsibleFilterContentProps {
  filterConfigs: FilterConfig[];
  filters: FilterValues;
  handleFilterChange: (key: string, value: string | boolean) => void;
  searchPlaceholder: string;
  config: { input: string; select: string; gap: string };
}

/**
 * Helper to check if any filters are active
 */
const hasActiveFilters = (filters: FilterValues, filterConfigs: FilterConfig[]): boolean => {
  if (filters.search && String(filters.search).trim() !== "") return true;
  return filterConfigs.some((filterConfig) => {
    if (filterConfig.type === "select") {
      const currentValue = filters[filterConfig.key];
      const defaultValue = filterConfig.defaultValue || "all";
      return currentValue && currentValue !== defaultValue;
    }
    if (filterConfig.type === "checkbox") {
      const currentValue = Boolean(filters[filterConfig.key]);
      const defaultValue = Boolean(filterConfig.defaultValue || false);
      return currentValue !== defaultValue;
    }
    return false;
  });
};

interface StandardFilterContentProps {
  filterConfigs: FilterConfig[];
  filters: FilterValues;
  handleFilterChange: (key: string, value: string | boolean) => void;
  searchPlaceholder: string;
  config: { input: string; select: string; gap: string };
}

/**
 * Standard filter content - non-collapsible mode
 */
const StandardFilterContent = ({
  filterConfigs,
  filters,
  handleFilterChange,
  searchPlaceholder,
  config,
}: StandardFilterContentProps) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center ${config.gap}`}>
      {/* Search Input */}
      <div className="relative flex-1 sm:min-w-48 w-full sm:w-auto">
        {React.createElement(getIcon("Search"), {
          className: "absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400",
        })}
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={filters.search || ""}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className={`
            w-full pl-8 ${config.input} 
            border border-gray-300 rounded-md
            focus:ring-1 focus:ring-blue-500 focus:border-blue-500
            bg-white
          `.trim()}
        />
        {filters.search && (
          <button
            onClick={() => handleFilterChange("search", "")}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {React.createElement(getIcon("X"), { className: "h-3 w-3" })}
          </button>
        )}
      </div>

      {/* Filter Dropdowns and Checkboxes */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
        {filterConfigs.map((filterConfig) => {
          if (filterConfig.type === "select" && filterConfig.options) {
            return (
              <Select
                key={filterConfig.key}
                value={String(filters[filterConfig.key] || filterConfig.defaultValue || "all")}
                onChange={(e) => handleFilterChange(filterConfig.key, e.target.value)}
                options={filterConfig.options}
                className={`
                  ${config.select} border border-gray-300 rounded-md
                  focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                  bg-white text-gray-700 w-full sm:w-auto
                `.trim()}
              />
            );
          }
          if (filterConfig.type === "checkbox") {
            return (
              <div key={filterConfig.key} className="flex items-center gap-2">
                <Checkbox
                  id={filterConfig.key}
                  checked={Boolean(filters[filterConfig.key] || filterConfig.defaultValue || false)}
                  onChange={(e) => handleFilterChange(filterConfig.key, e.target.checked)}
                />
                <label htmlFor={filterConfig.key} className="text-sm text-gray-700 cursor-pointer">
                  {filterConfig.label || filterConfig.key}
                </label>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

/**
 * Collapsible filter content - extracted to reduce complexity
 */
const CollapsibleFilterContent = ({
  filterConfigs,
  filters,
  handleFilterChange,
  searchPlaceholder,
  config,
}: CollapsibleFilterContentProps) => {
  return (
    <div className="px-4 pb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          {React.createElement(getIcon("Search"), {
            className: "absolute left-2.5 bottom-2 h-4 w-4 text-gray-400",
          })}
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className={`
              w-full pl-8 ${config.input} 
              border border-gray-300 rounded-md
              focus:ring-1 focus:ring-purple-500 focus:border-purple-500
              bg-white
            `.trim()}
          />
        </div>

        {/* Filter Dropdowns and Checkboxes */}
        {filterConfigs.map((filterConfig) => {
          if (filterConfig.type === "select" && filterConfig.options) {
            return (
              <div key={filterConfig.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {filterConfig.label ||
                    filterConfig.options
                      .find((opt) => opt.value === "all")
                      ?.label.replace("All ", "") ||
                    "Filter"}
                </label>
                <Select
                  value={String(filters[filterConfig.key] || filterConfig.defaultValue || "all")}
                  onChange={(e) => handleFilterChange(filterConfig.key, e.target.value)}
                  options={filterConfig.options}
                  className={`
                    ${config.select} border border-gray-300 rounded-md
                    focus:ring-1 focus:ring-purple-500 focus:border-purple-500
                    bg-white text-gray-700 w-full
                  `.trim()}
                />
              </div>
            );
          }
          if (filterConfig.type === "checkbox") {
            return (
              <div key={filterConfig.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
                  <Checkbox
                    id={filterConfig.key}
                    checked={Boolean(
                      filters[filterConfig.key] || filterConfig.defaultValue || false
                    )}
                    onChange={(e) => handleFilterChange(filterConfig.key, e.target.checked)}
                  />
                  <label
                    htmlFor={filterConfig.key}
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    {filterConfig.label || filterConfig.key}
                  </label>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

interface StandardFiltersProps {
  filters?: FilterValues;
  onFilterChange: (key: string, value: string | boolean) => void;
  filterConfigs?: FilterConfig[];
  showClearButton?: boolean;
  searchPlaceholder?: string;
  size?: "sm" | "md";
  className?: string;
  mode?: "collapsible" | "inline";
  defaultFilters?: FilterValues;
}

/**
 * Standardized compact filtering component with glassmorphism styling
 * Consistent, space-efficient filtering across all pages with proper borders and labeling
 */
const StandardFilters = ({
  filters = {},
  onFilterChange,
  filterConfigs = [],
  showClearButton = true,
  searchPlaceholder = "Search...",
  size = "md",
  className = "",
  mode = "inline",
  defaultFilters = {},
}: StandardFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filtersEnabled, setFiltersEnabled] = useState(true);

  const sizeConfig = {
    sm: {
      input: "px-2 py-1 text-sm",
      select: "px-2 py-1 text-sm",
      gap: "gap-2",
    },
    md: {
      input: "px-3 py-1.5 text-sm",
      select: "px-3 py-1.5 text-sm",
      gap: "gap-3",
    },
  };

  const config = sizeConfig[size];

  const handleFilterChange = (filterKey: string, value: string | boolean) => {
    onFilterChange(filterKey, value);
  };

  const clearAllFilters = () => {
    // Use provided defaultFilters or build from filterConfigs
    const clearedFilters: Record<string, string | boolean> = { ...defaultFilters };

    // If no defaultFilters provided, build from filterConfigs
    if (Object.keys(defaultFilters).length === 0) {
      clearedFilters.search = "";
      filterConfigs.forEach((filterConfig) => {
        if (filterConfig.type === "select") {
          clearedFilters[filterConfig.key] = filterConfig.defaultValue || "all";
        } else if (filterConfig.type === "checkbox") {
          clearedFilters[filterConfig.key] = filterConfig.defaultValue || false;
        }
      });
    }

    // Apply all cleared filters at once
    Object.entries(clearedFilters).forEach(([key, value]) => {
      handleFilterChange(key, value);
    });
  };

  // Toggle all filters on/off
  const toggleFilters = () => {
    if (filtersEnabled) {
      // Turn filters OFF - clear all and disable
      clearAllFilters();
      setFiltersEnabled(false);
      setIsExpanded(false);
    } else {
      // Turn filters ON - enable and auto-expand
      setFiltersEnabled(true);
      setIsExpanded(true);
    }
  };

  const filtersActive = hasActiveFilters(filters, filterConfigs);

  // Collapsible mode (like Debt filters with purple hue and toggle)
  if (mode === "collapsible") {
    return (
      <div className={`rounded-xl border-2 border-black bg-purple-50 ${className}`}>
        <CollapsibleFilterHeader
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded(!isExpanded)}
          hasActiveFilters={filtersActive}
          filtersEnabled={filtersEnabled}
          onToggleFilters={toggleFilters}
        />

        {/* Collapsible Content */}
        {isExpanded && filtersEnabled && (
          <CollapsibleFilterContent
            filterConfigs={filterConfigs}
            filters={filters}
            handleFilterChange={handleFilterChange}
            searchPlaceholder={searchPlaceholder}
            config={config}
          />
        )}
      </div>
    );
  }

  // Standard mode (existing design)
  return (
    <div
      className={`glassmorphism rounded-lg p-4 border border-white/20 ring-1 ring-gray-800/10 shadow-lg ${className}`}
    >
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          {React.createElement(getIcon("Filter"), { className: "h-4 w-4" })}
          Filters
        </h3>
        {showClearButton && filtersActive && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            {React.createElement(getIcon("X"), { className: "h-3 w-3" })}
            Clear All
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <StandardFilterContent
        filterConfigs={filterConfigs}
        filters={filters}
        handleFilterChange={handleFilterChange}
        searchPlaceholder={searchPlaceholder}
        config={config}
      />
    </div>
  );
};

export default StandardFilters;
