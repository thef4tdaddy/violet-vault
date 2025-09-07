import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const RecentTransactionsWidget = ({
  transactions = [],
  getEnvelopeOptions = () => [],
}) => {
  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className="glassmorphism rounded-2xl p-6 border-2 border-black ring-1 ring-gray-800/10">
      <h3 className="font-black text-black text-base mb-4">
        <span className="text-lg">R</span>ECENT{" "}
        <span className="text-lg">T</span>RANSACTIONS
      </h3>
      <div className="space-y-3">
        {transactions.map((transaction) => (
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
                {transaction.amount > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
              <div>
                <div className="font-medium">{transaction.description}</div>
                <div className="text-sm text-gray-600">
                  {new Date(transaction.date).toLocaleDateString()}
                  {transaction.envelopeId &&
                    transaction.envelopeId !== "unassigned" && (
                      <span className="ml-2">
                        →{" "}
                        {getEnvelopeOptions().find(
                          (opt) => opt.id === transaction.envelopeId,
                        )?.name || "Unknown"}
                      </span>
                    )}
                </div>
              </div>
            </div>
            <div
              className={`font-bold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}
            >
              {transaction.amount > 0 ? "+" : ""}$
              {Math.abs(transaction.amount).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactionsWidget;
