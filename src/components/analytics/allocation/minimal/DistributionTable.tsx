import React, { useState, useMemo } from "react";
import { getIcon } from "@/utils";
import { Button } from "@/components/ui";

export interface CategoryDistribution {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface DistributionTableProps {
  data: CategoryDistribution[];
  loading?: boolean;
  title?: string;
}

type SortField = "category" | "amount" | "percentage" | "transactionCount";
type SortDirection = "asc" | "desc";

// Helper: Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Helper: Format percentage
const formatPercentage = (percentage: number): string => {
  return `${percentage.toFixed(1)}%`;
};

// Loading state component
const TableLoading: React.FC = () => (
  <div
    className="bg-white rounded-2xl p-6 hard-border"
    role="region"
    aria-label="Distribution Table Loading"
    data-testid="distribution-table-loading"
  >
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-gray-200 rounded w-48"></div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  </div>
);

// Empty state component
const TableEmpty: React.FC<{ title: string }> = ({ title }) => (
  <div
    className="bg-white rounded-2xl p-6 hard-border"
    role="region"
    aria-label={title}
    data-testid="distribution-table"
  >
    <h3 className="text-lg font-black text-gray-900 mb-4">{title}</h3>
    <p className="text-gray-500 text-sm">No distribution data available</p>
  </div>
);

/**
 * Distribution Table Component
 *
 * Table view of category breakdown with sortable columns.
 * Pure text display, no charts, fully offline.
 *
 * Features:
 * - Sortable columns (category, amount, percentage, count)
 * - Percentage bar visualization
 * - Transaction count
 * - Responsive design
 * - No pie chart (Tier 1 = text only)
 *
 * Target: ~4KB
 *
 * @example
 * ```tsx
 * <DistributionTable
 *   data={[
 *     {
 *       category: "Groceries",
 *       amount: 500,
 *       percentage: 35,
 *       transactionCount: 12
 *     }
 *   ]}
 * />
 * ```
 */
// eslint-disable-next-line max-lines-per-function -- Component rendering logic requires more than 150 lines
export const DistributionTable: React.FC<DistributionTableProps> = ({
  data,
  loading = false,
  title = "Category Distribution",
}) => {
  const [sortField, setSortField] = useState<SortField>("amount");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(field === "category" ? "asc" : "desc");
    }
  };

  // Get sort icon
  const getSortIcon = (field: SortField): React.ReactNode => {
    if (sortField !== field) {
      return React.createElement(getIcon("ChevronsUpDown"), {
        className: "h-4 w-4",
      });
    }
    return React.createElement(getIcon(sortDirection === "asc" ? "ChevronUp" : "ChevronDown"), {
      className: "h-4 w-4",
    });
  };

  // Sort data
  const sortedData = useMemo(() => {
    const sorted = [...data];
    sorted.sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (sortField) {
        case "category":
          aVal = a.category.toLowerCase();
          bVal = b.category.toLowerCase();
          break;
        case "amount":
          aVal = a.amount;
          bVal = b.amount;
          break;
        case "percentage":
          aVal = a.percentage;
          bVal = b.percentage;
          break;
        case "transactionCount":
          aVal = a.transactionCount;
          bVal = b.transactionCount;
          break;
        default:
          aVal = a.amount;
          bVal = b.amount;
      }

      if (sortDirection === "asc") {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
    return sorted;
  }, [data, sortField, sortDirection]);

  if (loading) return <TableLoading />;
  if (data.length === 0) return <TableEmpty title={title} />;

  return (
    <div
      className="bg-white rounded-2xl p-6 hard-border"
      role="region"
      aria-label={title}
      data-testid="distribution-table"
    >
      {/* Title */}
      <h3 className="text-lg font-black text-gray-900 mb-4">{title}</h3>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead>
            <tr className="border-b-2 border-gray-200">
              {/* Category */}
              <th className="text-left py-3 px-2">
                <Button
                  onClick={() => handleSort("category")}
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 font-black text-xs uppercase tracking-wider text-gray-500 hover:text-gray-900 transition-colors p-0"
                  aria-label="Sort by category"
                  data-testid="sort-category"
                >
                  <span>Category</span>
                  {getSortIcon("category")}
                </Button>
              </th>

              {/* Amount */}
              <th className="text-right py-3 px-2">
                <Button
                  onClick={() => handleSort("amount")}
                  variant="ghost"
                  size="sm"
                  className="flex items-center justify-end gap-1 font-black text-xs uppercase tracking-wider text-gray-500 hover:text-gray-900 transition-colors ml-auto p-0"
                  aria-label="Sort by amount"
                  data-testid="sort-amount"
                >
                  <span>Amount</span>
                  {getSortIcon("amount")}
                </Button>
              </th>

              {/* Percentage */}
              <th className="text-right py-3 px-2">
                <Button
                  onClick={() => handleSort("percentage")}
                  variant="ghost"
                  size="sm"
                  className="flex items-center justify-end gap-1 font-black text-xs uppercase tracking-wider text-gray-500 hover:text-gray-900 transition-colors ml-auto p-0"
                  aria-label="Sort by percentage"
                  data-testid="sort-percentage"
                >
                  <span>%</span>
                  {getSortIcon("percentage")}
                </Button>
              </th>

              {/* Count */}
              <th className="text-right py-3 px-2">
                <Button
                  onClick={() => handleSort("transactionCount")}
                  variant="ghost"
                  size="sm"
                  className="flex items-center justify-end gap-1 font-black text-xs uppercase tracking-wider text-gray-500 hover:text-gray-900 transition-colors ml-auto p-0"
                  aria-label="Sort by transaction count"
                  data-testid="sort-count"
                >
                  <span>Count</span>
                  {getSortIcon("transactionCount")}
                </Button>
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedData.map((row, index) => (
              <tr
                key={row.category}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                data-testid={`distribution-row-${index}`}
              >
                {/* Category */}
                <td className="py-3 px-2">
                  <div className="font-bold text-sm text-gray-900">{row.category}</div>
                  {/* Percentage bar */}
                  <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all"
                      style={{ width: `${Math.min(row.percentage, 100)}%` }}
                      role="progressbar"
                      aria-valuenow={row.percentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      data-testid={`progress-bar-${index}`}
                    />
                  </div>
                </td>

                {/* Amount */}
                <td className="py-3 px-2 text-right">
                  <span className="font-bold text-sm text-gray-900">
                    {formatCurrency(row.amount)}
                  </span>
                </td>

                {/* Percentage */}
                <td className="py-3 px-2 text-right">
                  <span className="font-medium text-sm text-gray-600">
                    {formatPercentage(row.percentage)}
                  </span>
                </td>

                {/* Count */}
                <td className="py-3 px-2 text-right">
                  <span className="font-medium text-sm text-gray-600">{row.transactionCount}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DistributionTable;
