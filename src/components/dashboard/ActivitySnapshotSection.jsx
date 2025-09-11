import React from "react";
import { getIcon } from "../../utils";
import { useActivitySnapshot } from "../../hooks/dashboard/useActivitySnapshot";

/**
 * Activity Snapshot Section - Recent activity overview
 *
 * Features:
 * - Recent transactions (last 5)
 * - Upcoming bills (next 3)
 * - Recent paychecks (last 2)
 * - Quick action buttons
 */
const ActivitySnapshotSection = ({ setActiveView }) => {
  const { recentTransactions, upcomingBills, recentPaychecks } =
    useActivitySnapshot();

  const handleViewTransactions = () => {
    if (setActiveView) {
      setActiveView("transactions");
    }
  };

  const handleViewBills = () => {
    if (setActiveView) {
      setActiveView("bills");
    }
  };

  const handleViewPaychecks = () => {
    if (setActiveView) {
      setActiveView("paychecks");
    }
  };

  return (
    <div className="px-6 mb-6">
      <div className="glassmorphism rounded-lg p-6 border-2 border-black bg-blue-100/40 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          {React.createElement(getIcon("Activity"), {
            className: "h-6 w-6 text-blue-700",
          })}
          <h3 className="text-lg font-black text-black">
            <span className="text-xl">A</span>CTIVITY{" "}
            <span className="text-xl">S</span>NAPSHOT
          </h3>
        </div>

        {/* Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-blue-900">
                Recent Transactions
              </h4>
              <button
                onClick={handleViewTransactions}
                className="text-sm text-blue-700 hover:text-blue-900 font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-2">
              {recentTransactions && recentTransactions.length > 0 ? (
                recentTransactions.slice(0, 5).map((transaction, index) => (
                  <div
                    key={transaction.id || index}
                    className="flex justify-between items-center p-3 bg-white/50 rounded-lg"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.description || "Transaction"}
                      </div>
                      <div className="text-xs text-blue-700">
                        {transaction.date || "Recent"}
                      </div>
                    </div>
                    <div
                      className={`text-sm font-semibold ${
                        transaction.amount >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.amount >= 0 ? "+" : ""}$
                      {Math.abs(transaction.amount || 0).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-blue-700">
                  <div className="text-sm">No recent transactions</div>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Bills */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-blue-900">Upcoming Bills</h4>
              <button
                onClick={handleViewBills}
                className="text-sm text-blue-700 hover:text-blue-900 font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-2">
              {upcomingBills && upcomingBills.length > 0 ? (
                upcomingBills.slice(0, 3).map((bill, index) => (
                  <div
                    key={bill.id || index}
                    className="flex justify-between items-center p-3 bg-white/50 rounded-lg"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {bill.name || "Bill"}
                      </div>
                      <div className="text-xs text-blue-700">
                        Due: {bill.dueDate || "Soon"}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-red-600">
                      ${bill.amount?.toLocaleString() || "0.00"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-blue-700">
                  <div className="text-sm">No upcoming bills</div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Paychecks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-blue-900">Recent Paychecks</h4>
              <button
                onClick={handleViewPaychecks}
                className="text-sm text-blue-700 hover:text-blue-900 font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-2">
              {recentPaychecks && recentPaychecks.length > 0 ? (
                recentPaychecks.slice(0, 2).map((paycheck, index) => (
                  <div
                    key={paycheck.id || index}
                    className="flex justify-between items-center p-3 bg-white/50 rounded-lg"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {paycheck.employer || "Paycheck"}
                      </div>
                      <div className="text-xs text-blue-700">
                        {paycheck.date || "Recent"}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-green-600">
                      +${paycheck.netAmount?.toLocaleString() || "0.00"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-blue-700">
                  <div className="text-sm">No recent paychecks</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitySnapshotSection;
