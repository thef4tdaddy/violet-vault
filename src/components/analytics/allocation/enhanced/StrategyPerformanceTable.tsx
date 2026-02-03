/**
 * Strategy Performance Table Component
 * Created for Phase 2.4: Enhanced Chart Components (Tier 2)
 *
 * Sortable table showing allocation strategy performance metrics
 * Lazy-loaded only for Tier 2 (private-backend)
 */

import React, { useState, useMemo, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Button from "@/components/ui/buttons/Button";
import type { StrategyData } from "@/types/analyticsEnhanced";
import { ChartExportButton } from "../shared/ChartExportButton";
import { getIcon } from "@/utils";

export interface StrategyPerformanceTableProps {
  strategies: StrategyData[];
  className?: string;
}

type SortField = keyof StrategyData;
type SortDirection = "asc" | "desc";

/**
 * Recommendation badge component
 */
interface BadgeProps {
  variant: "good" | "fair" | "poor";
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ variant, children }) => {
  const variantClasses = {
    good: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    fair: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    poor: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
};

/**
 * StrategyPerformanceTable Component
 *
 * Displays strategy performance metrics in a sortable table with visual comparison
 *
 * @example
 * ```tsx
 * <StrategyPerformanceTable
 *   strategies={[
 *     { strategy: "Even Split", avgAmount: 125000, successRate: 95, recommendation: "good" },
 *     { strategy: "Last Split", avgAmount: 110000, successRate: 88, recommendation: "fair" }
 *   ]}
 * />
 * ```
 */
export const StrategyPerformanceTable: React.FC<StrategyPerformanceTableProps> = ({
  strategies,
  className = "",
}) => {
  const [sortBy, setSortBy] = useState<SortField>("strategy");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const chartRef = useRef<HTMLDivElement>(null);

  const ChevronUpIcon = getIcon("ChevronUp");
  const ChevronDownIcon = getIcon("ChevronDown");

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    return [...strategies].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [strategies, sortBy, sortDir]);

  const SortIcon = sortDir === "asc" ? ChevronUpIcon : ChevronDownIcon;

  return (
    <div ref={chartRef} className={`bg-white dark:bg-gray-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Strategy Performance</h3>
        <ChartExportButton chartRef={chartRef} filename="strategy-performance" />
      </div>

      {/* Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left pb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("strategy")}
                  className="font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  <span className="flex items-center gap-1">
                    Strategy
                    {sortBy === "strategy" && <SortIcon className="h-4 w-4" />}
                  </span>
                </Button>
              </th>
              <th className="text-left pb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("avgAmount")}
                  className="font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  <span className="flex items-center gap-1">
                    Avg Amount
                    {sortBy === "avgAmount" && <SortIcon className="h-4 w-4" />}
                  </span>
                </Button>
              </th>
              <th className="text-left pb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("successRate")}
                  className="font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  <span className="flex items-center gap-1">
                    Success Rate
                    {sortBy === "successRate" && <SortIcon className="h-4 w-4" />}
                  </span>
                </Button>
              </th>
              <th className="text-left pb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("recommendation")}
                  className="font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  <span className="flex items-center gap-1">
                    Recommendation
                    {sortBy === "recommendation" && <SortIcon className="h-4 w-4" />}
                  </span>
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, index) => (
              <tr
                key={s.strategy}
                className={`border-b border-gray-100 dark:border-gray-700 ${index % 2 === 0 ? "bg-gray-50 dark:bg-gray-900/50" : ""}`}
              >
                <td className="py-3 font-medium text-gray-900 dark:text-white">{s.strategy}</td>
                <td className="py-3 text-gray-700 dark:text-gray-300">
                  ${(s.avgAmount / 100).toFixed(2)}
                </td>
                <td className="py-3 text-gray-700 dark:text-gray-300">{s.successRate}%</td>
                <td className="py-3">
                  <Badge variant={s.recommendation}>{s.recommendation}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bar chart comparison */}
      <div className="mt-6">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
          Visual Comparison
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={sorted}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
            <XAxis dataKey="strategy" stroke="#6b7280" className="dark:stroke-gray-400" />
            <YAxis
              tickFormatter={(value: number) => `$${(value / 100).toFixed(0)}`}
              stroke="#6b7280"
              className="dark:stroke-gray-400"
            />
            <Tooltip
              formatter={(value: number | undefined) =>
                value !== undefined ? [`$${(value / 100).toFixed(2)}`, "Avg Amount"] : ["N/A", "Avg Amount"]
              }
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="avgAmount" fill="#8884d8" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insights panel */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Insights</h4>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          {sorted.length > 0 && (
            <>
              <p>
                • <strong>{sorted[0]!.strategy}</strong> has the{" "}
                {sortBy === "avgAmount" && sortDir === "desc"
                  ? "highest"
                  : sortBy === "successRate" && sortDir === "desc"
                    ? "best"
                    : "top"}{" "}
                performance in the selected metric.
              </p>
              {strategies.filter((s) => s.recommendation === "good").length > 0 && (
                <p>
                  • {strategies.filter((s) => s.recommendation === "good").length} strateg
                  {strategies.filter((s) => s.recommendation === "good").length === 1 ? "y" : "ies"}{" "}
                  rated as <strong>good</strong>.
                </p>
              )}
              {strategies.filter((s) => s.recommendation === "poor").length > 0 && (
                <p className="text-amber-700 dark:text-amber-400">
                  ⚠ {strategies.filter((s) => s.recommendation === "poor").length} strateg
                  {strategies.filter((s) => s.recommendation === "poor").length === 1 ? "y" : "ies"}{" "}
                  needs improvement.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrategyPerformanceTable;
