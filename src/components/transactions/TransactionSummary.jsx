import React from "react";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

const TransactionSummary = ({ transactions = [] }) => {
  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netCashFlow = totalIncome - totalExpenses;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="glassmorphism rounded-xl p-6">
        <div className="flex items-center">
          <div className="relative mr-4">
            <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-lg opacity-30"></div>
            <div className="relative bg-emerald-500 p-3 rounded-2xl">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-1">Total Income</p>
            <p className="text-2xl font-bold text-emerald-600">${totalIncome.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="glassmorphism rounded-xl p-6">
        <div className="flex items-center">
          <div className="relative mr-4">
            <div className="absolute inset-0 bg-red-500 rounded-2xl blur-lg opacity-30"></div>
            <div className="relative bg-red-500 p-3 rounded-2xl">
              <TrendingDown className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-1">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="glassmorphism rounded-xl p-6">
        <div className="flex items-center">
          <div className="relative mr-4">
            <div
              className={`absolute inset-0 ${
                netCashFlow >= 0 ? "bg-cyan-500" : "bg-amber-500"
              } rounded-2xl blur-lg opacity-30`}
            ></div>
            <div
              className={`relative ${
                netCashFlow >= 0 ? "bg-cyan-500" : "bg-amber-500"
              } p-3 rounded-2xl`}
            >
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-1">Net Cash Flow</p>
            <p
              className={`text-2xl font-bold ${
                netCashFlow >= 0 ? "text-cyan-600" : "text-amber-600"
              }`}
            >
              {netCashFlow >= 0 ? "+" : ""}${netCashFlow.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionSummary;
