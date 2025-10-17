import React from "react";
import { getIcon } from "../../utils";
import { hasChanges, formatAmountChange } from "../../utils/bills/billUpdateHelpers";

const BulkUpdateEditor = ({
  selectedBills,
  changes,
  updateMode,
  updateChange,
  applyBulkChange,
  resetChanges,
}) => {
  return (
    <>
      {/* Bulk Actions */}
      <div className="bg-gradient-to-r from-gray-50/80 to-purple-50/80 backdrop-blur-sm p-4 rounded-xl mb-6 border-2 border-black shadow-lg">
        <h4 className="font-black text-gray-900 mb-3">APPLY TO ALL SELECTED BILLS</h4>
        <div className="flex gap-3 flex-wrap">
          {(updateMode === "amounts" || updateMode === "both") && (
            <div className="flex items-center gap-2">
              <div className="glassmorphism rounded-full p-2 border border-gray-300">
                {React.createElement(getIcon("DollarSign"), {
                  className: "h-4 w-4 text-purple-600",
                })}
              </div>
              <input
                type="number"
                step="0.01"
                placeholder="Set all amounts to..."
                className="px-3 py-2 border-2 border-black rounded-lg text-sm w-40 glassmorphism backdrop-blur-sm shadow-md focus:shadow-lg transition-all"
                onChange={(e) => {
                  if (e.target.value) {
                    applyBulkChange("amount", parseFloat(e.target.value) || 0);
                  }
                }}
              />
            </div>
          )}

          {(updateMode === "dates" || updateMode === "both") && (
            <div className="flex items-center gap-2">
              <div className="glassmorphism rounded-full p-2 border border-gray-300">
                {React.createElement(getIcon("Calendar"), {
                  className: "h-4 w-4 text-purple-600",
                })}
              </div>
              <input
                type="date"
                className="px-3 py-2 border-2 border-black rounded-lg text-sm glassmorphism backdrop-blur-sm shadow-md focus:shadow-lg transition-all"
                onChange={(e) => {
                  if (e.target.value) {
                    applyBulkChange("dueDate", e.target.value);
                  }
                }}
              />
            </div>
          )}

          <button
            onClick={resetChanges}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 glassmorphism backdrop-blur-sm rounded-lg text-sm border-2 border-black shadow-md hover:shadow-lg transition-all font-medium"
          >
            {React.createElement(getIcon("Undo2"), { className: "h-4 w-4" })}
            Reset All
          </button>
        </div>
      </div>

      {/* Bills List */}
      <div className="overflow-y-auto max-h-80">
        <div className="space-y-3">
          {selectedBills.map((bill) => {
            const change = changes[bill.id];
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
                          onChange={(e) =>
                            updateChange(bill.id, "amount", parseFloat(e.target.value) || 0)
                          }
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
                            change?.dueDate !== change?.originalDueDate
                              ? "bg-blue-50/80"
                              : "bg-white/60"
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
          })}
        </div>
      </div>
    </>
  );
};

export default BulkUpdateEditor;
