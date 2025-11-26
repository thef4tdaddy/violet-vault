import React from "react";
import { getIcon } from "../../../utils";
import { formatBillAmount } from "../../../utils/bills/billDetailUtils";
import { getFrequencyDisplayText } from "../../../utils/common/frequencyCalculations";

interface BillForStats {
  amount?: number;
  dueDate?: string | Date | null;
  frequency?: string;
}

/**
 * Main stats section for BillDetailModal
 * Extracted to reduce modal complexity
 */
export const BillDetailStats = ({ bill }: { bill: BillForStats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-purple-50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-purple-600 font-medium">Amount Due</p>
            <p className="text-2xl font-bold text-purple-700">${formatBillAmount(bill.amount)}</p>
          </div>
          {React.createElement(getIcon("DollarSign"), {
            className: "h-8 w-8 text-purple-500",
          })}
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 font-medium">Due Date</p>
            <p className="text-lg font-bold text-blue-700">
              {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "Not set"}
            </p>
          </div>
          {React.createElement(getIcon("Calendar"), {
            className: "h-8 w-8 text-blue-500",
          })}
        </div>
      </div>

      <div className="bg-green-50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-600 font-medium">Frequency</p>
            <p className="text-lg font-bold text-green-700">
              {getFrequencyDisplayText(bill.frequency, bill.customFrequency)}
            </p>
          </div>
          {React.createElement(getIcon("Clock"), {
            className: "h-8 w-8 text-green-500",
          })}
        </div>
      </div>
    </div>
  );
};
