import React from "react";
import { getIcon } from "../../utils";
import BillConfidenceIndicator from "./BillConfidenceIndicator";

/**
 * Bill information header section
 * Shows provider, category, amount, and stats
 */
const BillInfoHeader = ({ bill }) => {
  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            {bill.provider}
            <BillConfidenceIndicator confidence={bill.confidence} />
          </h4>
          <p className="text-sm text-gray-600">{bill.category}</p>
        </div>

        <div className="text-right">
          <p className="font-semibold text-gray-900">
            ${Math.abs(bill.amount).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 capitalize">{bill.frequency}</p>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          {React.createElement(getIcon("Calendar"), { className: "h-3 w-3" })}
          Due: {new Date(bill.dueDate).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-1">
          {React.createElement(getIcon("TrendingUp"), { className: "h-3 w-3" })}
          {bill.discoveryData.transactionCount} transactions
        </div>
        <div className="flex items-center gap-1">
          {React.createElement(getIcon("Zap"), { className: "h-3 w-3" })}
          Every ~{bill.discoveryData.avgInterval} days
        </div>
      </div>
    </>
  );
};

export default BillInfoHeader;