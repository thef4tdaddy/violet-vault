import React, { useState } from "react";
import { getIcon } from "../../utils/icons";

export interface FilterConfig {
  key: string;
  label?: string;
  type: "select" | "checkbox";
  options?: Array<{ value: string; label: string }>;
  defaultValue?: string | boolean;
}

interface StandardFiltersProps {
  filters: Record<string, string | boolean | undefined>;
  search?: string;
  onToggleFilters: (filters: Record<string, string | boolean | undefined>) => void;
  onSearchChange?: (search: string) => void;
  onFilterChange?: (key: string, value: string | boolean) => void;
}

/**
 * Standardized compact filtering component with glassmorphism styling
 * Consistent, space-efficient filtering across all pages with proper borders and labeling
 */
const StandardFilters = ({
  filters,
  onToggleFilters,
  onSearchChange,
  onFilterChange,
}: StandardFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersEnabled] = useState(true);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearchChange?.(term);
  };

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleFilterChange = (key: string, value: string | boolean) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };
    onToggleFilters(newFilters);
    onFilterChange?.(key, value);
  };

  return (
    <div>
      <div
        className={`flex items-center justify-between p-4 rounded-t-xl transition-colors ${
          !isExpanded ? "cursor-pointer hover:bg-gray-100" : ""
        }`}
        onClick={!isExpanded ? handleToggleExpanded : undefined}
      >
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          {React.createElement(getIcon("Filter"), {
            className: `h-4 w-4 ${filtersEnabled ? "text-purple-600" : "text-gray-400"}`,
          })}
          <span
            className={`text-sm font-medium ${
              filtersEnabled ? "text-purple-900" : "text-gray-500"
            }`}
          >
            Filters & Sorting
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search transactions..."
            className="px-3 py-2 border-2 border-black rounded-lg bg-white/90 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-offset-2 focus:border-purple-500 transition-all w-full"
          />
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            {isExpanded ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="mt-4 space-y-2">
          {Object.entries(filters).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between p-2 bg-white/80 rounded-lg border border-gray-200"
            >
              <span className="text-sm font-medium text-gray-900">{key}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onFilterChange?.(key, !filters[key])}
                  className={`p-1 rounded ${
                    value ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                  } transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                >
                  {value ? "Enabled" : "Disabled"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StandardFilters;
