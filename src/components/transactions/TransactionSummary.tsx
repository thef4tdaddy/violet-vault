import React from "react";
import { getIcon } from "@/utils";
import type { Transaction } from "@/types/finance";

interface TransactionSummaryProps {
  transactions?: Transaction[];
}

const TransactionSummary: React.FC<TransactionSummaryProps> = ({ transactions = [] }) => {
  const totalIncome = transactions
    .filter((t) => t && typeof t.amount === "number" && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t && typeof t.amount === "number" && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netCashFlow = totalIncome - totalExpenses;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm">Total Income</p>
            <p className="text-2xl font-bold">${totalIncome.toFixed(2)}</p>
          </div>
          {React.createElement(getIcon("TrendingUp"), {
            className: "h-8 w-8 text-emerald-200",
          })}
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100 text-sm">Total Expenses</p>
            <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
          </div>
          {React.createElement(getIcon("TrendingDown"), {
            className: "h-8 w-8 text-red-200",
          })}
        </div>
      </div>

      <div
        className={`bg-gradient-to-br ${
          netCashFlow >= 0 ? "from-cyan-500 to-cyan-600" : "from-amber-500 to-amber-600"
        } p-4 rounded-lg text-white`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className={`${netCashFlow >= 0 ? "text-cyan-100" : "text-amber-100"} text-sm`}>
              Net Cash Flow
            </p>
            <p className="text-2xl font-bold">
              {netCashFlow >= 0 ? "+" : ""}${netCashFlow.toFixed(2)}
            </p>
          </div>
          {React.createElement(getIcon("DollarSign"), {
            className: `h-8 w-8 ${netCashFlow >= 0 ? "text-cyan-200" : "text-amber-200"}`,
          })}
        </div>
      </div>
    </div>
  );
};

export default TransactionSummary;
