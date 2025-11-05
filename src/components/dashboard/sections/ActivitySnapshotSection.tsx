import React from "react";
import { getIcon } from "@/utils";
import { Button } from "@/components/ui";
import type { Bill, PaycheckHistory } from "@/db/types";
import { formatDate } from "@/utils/common/dateFormatters";
import { MAX_RECENT_TRANSACTIONS, MAX_RECENT_BILLS, MAX_RECENT_PAYCHECKS } from "@/constants/budget";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
}

interface ActivitySnapshotSectionProps {
  recentTransactions: Transaction[];
  upcomingBills: Bill[];
  recentPaychecks: PaycheckHistory[];
  onViewTransactions?: () => void;
  onViewBills?: () => void;
  onViewPaychecks?: () => void;
}

/**
 * Activity Snapshot Section
 * Shows recent transactions, upcoming bills, and recent paychecks
 */
const ActivitySnapshotSection = ({
  recentTransactions,
  upcomingBills,
  recentPaychecks,
  onViewTransactions,
  onViewBills,
  onViewPaychecks,
}: ActivitySnapshotSectionProps) => {
  return (
    <div className="glassmorphism rounded-2xl p-6 border border-white/20">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        {React.createElement(getIcon("Activity"), {
          className: "h-5 w-5 mr-2 text-indigo-600",
        })}
        Activity Snapshot
      </h3>

      <div className="space-y-6">
        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700">Last 5 Transactions</h4>
            {onViewTransactions && (
              <Button
                onClick={onViewTransactions}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                View All
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-gray-500">No recent transactions</p>
            ) : (
              recentTransactions.slice(0, MAX_RECENT_TRANSACTIONS).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-2 bg-white/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {React.createElement(
                      getIcon(transaction.amount > 0 ? "TrendingUp" : "TrendingDown"),
                      {
                        className: `h-4 w-4 ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`,
                      }
                    )}
                    <span className="text-sm text-gray-700">{transaction.description}</span>
                  </div>
                  <span
                    className={`text-sm font-bold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Bills */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700">Upcoming Bills (7 days)</h4>
            {onViewBills && (
              <Button onClick={onViewBills} className="text-xs text-blue-600 hover:text-blue-700">
                View All
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {upcomingBills.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming bills</p>
            ) : (
              upcomingBills.slice(0, MAX_RECENT_BILLS).map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-2 bg-white/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {React.createElement(getIcon("Calendar"), {
                      className: "h-4 w-4 text-orange-600",
                    })}
                    <span className="text-sm text-gray-700">{bill.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    ${bill.amount.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Paychecks */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700">Recent Paychecks</h4>
            {onViewPaychecks && (
              <Button
                onClick={onViewPaychecks}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                View All
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {recentPaychecks.length === 0 ? (
              <p className="text-sm text-gray-500">No recent paychecks</p>
            ) : (
              recentPaychecks.slice(0, MAX_RECENT_PAYCHECKS).map((paycheck) => (
                <div
                  key={paycheck.id}
                  className="flex items-center justify-between p-2 bg-white/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {React.createElement(getIcon("DollarSign"), {
                      className: "h-4 w-4 text-green-600",
                    })}
                    <span className="text-sm text-gray-700">{formatDate(paycheck.date)}</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">
                    ${paycheck.amount.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ActivitySnapshotSection);
