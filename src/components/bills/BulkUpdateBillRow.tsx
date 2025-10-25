import React from "react";
import { getIcon } from "../../utils";
import { hasChanges, formatAmountChange } from "../../utils/bills/billUpdateHelpers";

/**
 * Individual bill row component for BulkUpdateEditor
 * Extracted to reduce complexity
 */
const BulkUpdateBillRow = ({ bill, change, updateMode, updateChange }) => {
  const billHasChanges = hasChanges(change);
  const amountChange = formatAmountChange(change?.originalAmount, change?.amount);

  return (
    <div
      key={bill.id}
      className={`p-4 rounded-xl border-2 border-black shadow-md transition-all ${
        billHasChanges
          ? "bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm shadow-lg"
          : "bg-white/60 backdrop-blur-sm"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h5 className="font-bold text-gray-900">{bill.provider || bill.description}</h5>
          <p className="text-sm text-purple-800 font-medium">{bill.category}</p>
        </div>

        <div className="flex items-center gap-4">
          {(updateMode === "amounts" || updateMode === "both") && (
            <div className="flex items-center gap-2">
              {React.createElement(getIcon("DollarSign"), {
                className: "h-4 w-4 text-purple-600",
              })}
              <input
                type="number"
                step="0.01"
                value={Math.abs(change?.amount || 0)}
                onChange={(e) => updateChange(bill.id, "amount", parseFloat(e.target.value) || 0)}
                className={`w-24 px-2 py-1 border-2 border-black rounded text-sm glassmorphism backdrop-blur-sm shadow-md focus:shadow-lg transition-all ${
                  amountChange?.hasChange ? "bg-blue-50/80" : "bg-white/60"
                }`}
              />
              {amountChange?.hasChange && (
                <span className="text-xs text-purple-700 font-medium">
                  (was ${amountChange.original})
                </span>
              )}
            </div>
          )}

          {(updateMode === "dates" || updateMode === "both") && (
            <div className="flex items-center gap-2">
              {React.createElement(getIcon("Calendar"), {
                className: "h-4 w-4 text-purple-600",
              })}
              <input
                type="date"
                value={change?.dueDate || ""}
                onChange={(e) => updateChange(bill.id, "dueDate", e.target.value)}
                className={`px-2 py-1 border-2 border-black rounded text-sm glassmorphism backdrop-blur-sm shadow-md focus:shadow-lg transition-all ${
                  change?.dueDate !== change?.originalDueDate ? "bg-blue-50/80" : "bg-white/60"
                }`}
              />
            </div>
          )}

          {billHasChanges && (
            <div className="glassmorphism rounded-full p-1 border border-blue-300">
              {React.createElement(getIcon("CheckCircle"), {
                className: "h-4 w-4 text-blue-600",
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkUpdateBillRow;
