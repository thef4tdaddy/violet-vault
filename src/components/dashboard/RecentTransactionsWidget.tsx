import React from "react";
import { getIcon } from "../../utils";
import type { Transaction } from "../../types/finance";

// Define interfaces for component props
interface EnvelopeOption {
  id: string;
  name: string;
}

interface RecentTransactionsWidgetProps {
  transactions: Transaction[];
  getEnvelopeOptions: () => EnvelopeOption[];
}

const RecentTransactionsWidget = ({
  transactions = [],
  getEnvelopeOptions = () => [],
}: RecentTransactionsWidgetProps) => {
  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-6 hard-border shadow-lg">
      <h3 className="font-black text-black text-base mb-4">
        <span className="text-lg">R</span>ECENT <span className="text-lg">T</span>RANSACTIONS
      </h3>
      <div className="space-y-3">
        {transactions.map((transaction: Transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-full ${
                  transaction.amount > 0 ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {React.createElement(
                  getIcon(transaction.amount > 0 ? "TrendingUp" : "TrendingDown"),
                  {
                    className: `h-4 w-4 ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`,
                  }
                )}
              </div>
              <div>
                <div className="font-medium">{transaction.description}</div>
                <div className="text-sm text-gray-600">
                  {new Date(transaction.date).toLocaleDateString()}
                  {transaction.envelopeId && transaction.envelopeId !== "unassigned" && (
                    <span className="ml-2">
                      →{" "}
                      {getEnvelopeOptions().find(
                        (opt: EnvelopeOption) => opt.id === transaction.envelopeId
                      )?.name || "Unknown"}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div
              className={`font-bold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}
            >
              {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactionsWidget;
