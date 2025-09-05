import React from "react";
import { X } from "lucide-react";
import {
  formatAmountChange,
  formatDateChange,
  hasChanges,
} from "../../../utils/bills/billUpdateHelpers";

const BulkUpdateConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedBills,
  changes,
  summary,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-60">
      <div className="glassmorphism rounded-2xl w-full max-w-2xl shadow-2xl border-2 border-black">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-black">
              CONFIRM BULK CHANGES
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 glassmorphism backdrop-blur-sm rounded-full p-2 shadow-lg hover:shadow-xl transition-all border-2 border-black"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-100/60 to-purple-100/60 backdrop-blur-sm p-4 rounded-xl border-2 border-black shadow-lg">
              <h4 className="font-black text-purple-900 mb-2">
                SUMMARY OF CHANGES
              </h4>
              <div className="text-sm text-purple-800 space-y-1">
                <p className="font-medium">
                  • {summary.changedBills} of {summary.totalBills} bills will be
                  updated
                </p>
                {summary.totalAmountChange !== 0 && (
                  <p className="font-medium">
                    • Net amount change:{" "}
                    {summary.totalAmountChange > 0 ? "+" : ""}$
                    {summary.totalAmountChange.toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
              {selectedBills.map((bill) => {
                const change = changes[bill.id];
                if (!change || !hasChanges(change)) return null;

                const amountChange = formatAmountChange(
                  change.originalAmount,
                  change.amount,
                );
                const dateChange = formatDateChange(
                  change.originalDueDate,
                  change.dueDate,
                );

                return (
                  <div
                    key={bill.id}
                    className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-gray-200 shadow-sm"
                  >
                    <h5 className="font-bold text-gray-900">
                      {bill.provider || bill.description}
                    </h5>
                    <div className="text-sm text-purple-800 space-y-1 mt-1">
                      {amountChange.hasChange && (
                        <p className="font-medium">
                          Amount:{" "}
                          <span className="text-gray-600">
                            ${amountChange.original}
                          </span>{" "}
                          →{" "}
                          <span className="text-purple-900 font-bold">
                            ${amountChange.updated}
                          </span>
                        </p>
                      )}
                      {dateChange.hasChange && (
                        <p className="font-medium">
                          Due Date:{" "}
                          <span className="text-gray-600">
                            {dateChange.original}
                          </span>{" "}
                          →{" "}
                          <span className="text-purple-900 font-bold">
                            {dateChange.updated}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200/80 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300/80 transition-all border-2 border-black shadow-md hover:shadow-lg font-bold"
              >
                Back to Edit
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all border-2 border-black shadow-md hover:shadow-lg font-black"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUpdateConfirmModal;
