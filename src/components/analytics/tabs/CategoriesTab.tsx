import React, { useMemo } from "react";
import { DistributionPieChartWithDetails } from "../../charts";

interface TransactionSummary {
  id?: string | number;
  date?: string;
  amount?: number;
  description?: string;
  merchant?: string;
  envelopeId?: string;
  envelopeName?: string;
}

interface CategoryEntry {
  name: string;
  amount: number;
  count: number;
  color?: string;
}

interface CategoriesTabProps {
  categoryBreakdown?: CategoryEntry[];
  selectedCategory?: string | null;
  onCategorySelect?: (name: string | null) => void;
  categoryTransactions?: TransactionSummary[];
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const dateFormatter = (value?: string) => {
  if (!value) return "Unknown date";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
};

/**
 * Categories tab content for analytics
 * Extracted from ChartsAndAnalytics.jsx to reduce complexity
 */
const CategoriesTab: React.FC<CategoriesTabProps> = ({
  categoryBreakdown = [],
  selectedCategory,
  onCategorySelect,
  categoryTransactions = [],
}) => {
  const transactionsPreview = useMemo(() => {
    return categoryTransactions
      .filter((txn) => typeof txn.amount === "number")
      .slice(0, 15);
  }, [categoryTransactions]);

  const detailContent = (
    <div className="pt-4 border-t border-gray-200">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">Transactions</h4>
      {selectedCategory ? (
        transactionsPreview.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {transactionsPreview.map((txn, index) => (
              <div
                key={txn.id || `${txn.date}-${index}`}
                className="flex items-center justify-between bg-white/60 rounded-lg p-3"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {txn.description || txn.merchant || "Transaction"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {dateFormatter(txn.date)}
                    {txn.envelopeName ? ` • ${txn.envelopeName}` : ""}
                  </p>
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {currencyFormatter.format(Math.abs(txn.amount || 0))}
                </div>
              </div>
            ))}
            {categoryTransactions.length > transactionsPreview.length && (
              <p className="text-xs text-gray-500">
                Showing first {transactionsPreview.length} of {categoryTransactions.length} transactions
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-500">No transactions found for this category.</p>
        )
      ) : (
        <p className="text-xs text-gray-500">Select a category to inspect its transactions.</p>
      )}
    </div>
  );

  return (
    <DistributionPieChartWithDetails
      title="Spending by Category"
      subtitle=""
      data={categoryBreakdown as unknown as Array<Record<string, unknown>>}
      dataKey="amount"
      nameKey="name"
      maxItems={8}
      selectedName={selectedCategory || undefined}
      onSelect={(name) => onCategorySelect?.(name)}
      detailContent={detailContent}
    />
  );
};

export default CategoriesTab;
