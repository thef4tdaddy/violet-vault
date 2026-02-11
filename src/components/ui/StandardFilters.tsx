import React, { useMemo, useState } from "react";
import { getIcon } from "@/utils/ui/icons";

type FilterControlType = "select" | "checkbox" | "text";

export interface FilterConfig {
  key: string;
  label?: string;
  type: FilterControlType;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: string | boolean;
  placeholder?: string;
}

interface StandardFiltersProps {
  filters: Record<string, string | boolean | undefined>;
  filterConfigs: FilterConfig[];
  defaultFilters?: Record<string, string | boolean>;
  mode?: "collapsible" | "inline";
  searchPlaceholder?: string;
  searchValue?: string;
  onFilterChange: (key: string, value: string | boolean) => void;
  onSearchChange?: (search: string) => void;
  onResetFilters?: () => void;
}

const resolveFilterValue = (
  filters: Record<string, string | boolean | undefined>,
  config: FilterConfig
) => {
  if (typeof filters[config.key] !== "undefined") {
    return filters[config.key];
  }
  if (typeof config.defaultValue !== "undefined") {
    return config.defaultValue;
  }
  return config.type === "checkbox" ? false : "";
};

const StandardFilters = ({
  filters,
  filterConfigs,
  defaultFilters,
  mode = "collapsible",
  searchPlaceholder = "Search...",
  searchValue,
  onFilterChange,
  onSearchChange,
  onResetFilters,
}: StandardFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(mode === "inline");
  const controlledSearch = searchValue ?? "";

  const resolvedFilters = useMemo(
    () =>
      filterConfigs.map((config) => ({
        config,
        value: resolveFilterValue(filters, config),
      })),
    [filterConfigs, filters]
  );

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(event.target.value);
  };

  const handleReset = () => {
    if (defaultFilters) {
      Object.entries(defaultFilters).forEach(([key, value]) => {
        onFilterChange(key, value);
      });
    }
    onResetFilters?.();
  };

  const renderFilterControl = (config: FilterConfig, value: string | boolean | undefined) => {
    if (config.type === "checkbox") {
      const checked = Boolean(value);
      return (
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => onFilterChange(config.key, event.target.checked)}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-800">{config.label ?? config.key}</span>
        </label>
      );
    }

    return (
      <label className="flex flex-col text-sm text-gray-800">
        <span className="font-medium mb-1">{config.label ?? config.key}</span>
        {config.type === "select" ? (
          <select
            value={String(value ?? "")}
            onChange={(event) => onFilterChange(config.key, event.target.value)}
            className="px-3 py-2 border-2 border-black rounded-lg bg-white/90 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-offset-2 focus:border-purple-500 transition-all"
          >
            {(config.options ?? []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={String(value ?? "")}
            onChange={(event) => onFilterChange(config.key, event.target.value)}
            placeholder={config.placeholder}
            className="px-3 py-2 border-2 border-black rounded-lg bg-white/90 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-offset-2 focus:border-purple-500 transition-all"
          />
        )}
      </label>
    );
  };

  return (
    <div className="glassmorphism rounded-xl border-2 border-black ring-1 ring-gray-800/10 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center space-x-2">
          {React.createElement(getIcon("Filter"), {
            className: "h-4 w-4 text-purple-600",
          })}
          <span className="text-sm font-semibold text-purple-900">Filters & Sorting</span>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3 min-w-[220px]">
          {onSearchChange && (
            <input
              type="text"
              value={controlledSearch}
              onChange={handleSearch}
              placeholder={searchPlaceholder}
              className="flex-1 px-3 py-2 border-2 border-black rounded-lg bg-white/90 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-offset-2 focus:border-purple-500 transition-all"
            />
          )}
          {mode === "collapsible" && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="px-3 py-2 text-xs font-bold rounded-lg border-2 border-black bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              {isExpanded ? "Hide" : "Show"}
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {resolvedFilters.map(({ config, value }) => (
            <div
              key={config.key}
              className="flex items-center justify-between gap-4 p-3 bg-white/80 rounded-lg border border-gray-200"
            >
              {renderFilterControl(config, value)}
            </div>
          ))}

          {(defaultFilters || onResetFilters) && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 text-xs font-semibold border-2 border-black rounded-lg bg-white/80 hover:bg-white"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StandardFilters;
