import React, { useState, useMemo } from "react";
import {
  DollarSign,
  Calendar,
  CheckCircle,
  X,
  Edit3,
  Clock,
  AlertTriangle,
  Undo2,
} from "lucide-react";

const BulkBillUpdateModal = ({ isOpen, onClose, selectedBills = [], onUpdateBills, onError }) => {
  const [updateMode, setUpdateMode] = useState("amounts"); // "amounts", "dates", "both"
  const [changes, setChanges] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Reset changes when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      const initialChanges = {};
      selectedBills.forEach((bill) => {
        initialChanges[bill.id] = {
          amount: bill.amount,
          dueDate: bill.dueDate || "",
          originalAmount: bill.amount,
          originalDueDate: bill.dueDate || "",
        };
      });
      setChanges(initialChanges);
      setShowConfirmation(false);
    }
  }, [isOpen, selectedBills]);

  const updateChange = (billId, field, value) => {
    setChanges((prev) => ({
      ...prev,
      [billId]: {
        ...prev[billId],
        [field]: value,
      },
    }));
  };

  const applyBulkChange = (field, value) => {
    const newChanges = { ...changes };
    selectedBills.forEach((bill) => {
      if (newChanges[bill.id]) {
        newChanges[bill.id][field] = value;
      }
    });
    setChanges(newChanges);
  };

  const resetChanges = () => {
    const resetChanges = {};
    selectedBills.forEach((bill) => {
      resetChanges[bill.id] = {
        amount: bill.amount,
        dueDate: bill.dueDate || "",
        originalAmount: bill.amount,
        originalDueDate: bill.dueDate || "",
      };
    });
    setChanges(resetChanges);
  };

  const summary = useMemo(() => {
    const changedBills = selectedBills.filter((bill) => {
      const change = changes[bill.id];
      return (
        change &&
        (change.amount !== change.originalAmount || change.dueDate !== change.originalDueDate)
      );
    });

    const totalAmountChange = changedBills.reduce((sum, bill) => {
      const change = changes[bill.id];
      return sum + (Math.abs(change?.amount || 0) - Math.abs(change?.originalAmount || 0));
    }, 0);

    return {
      changedBills: changedBills.length,
      totalBills: selectedBills.length,
      totalAmountChange,
      hasChanges: changedBills.length > 0,
    };
  }, [selectedBills, changes]);

  const handleSubmit = () => {
    if (!summary.hasChanges) {
      onError?.("No changes to apply");
      return;
    }
    setShowConfirmation(true);
  };

  const confirmChanges = async () => {
    try {
      const updatedBills = selectedBills
        .map((bill) => {
          const change = changes[bill.id];
          if (!change) return bill;

          const hasChanges =
            change.amount !== change.originalAmount || change.dueDate !== change.originalDueDate;

          if (!hasChanges) return bill;

          return {
            ...bill,
            amount: Math.abs(change.amount), // Ensure positive amount
            dueDate: change.dueDate || null,
            lastModified: new Date().toISOString(),
            modificationHistory: [
              ...(bill.modificationHistory || []),
              {
                timestamp: new Date().toISOString(),
                type: "bulk_update",
                changes: {
                  ...(change.amount !== change.originalAmount && {
                    amount: { from: change.originalAmount, to: change.amount },
                  }),
                  ...(change.dueDate !== change.originalDueDate && {
                    dueDate: { from: change.originalDueDate, to: change.dueDate },
                  }),
                },
              },
            ],
          };
        })
        .filter((bill) => {
          const change = changes[bill.id];
          return (
            change &&
            (change.amount !== change.originalAmount || change.dueDate !== change.originalDueDate)
          );
        });

      await onUpdateBills(updatedBills);
      onClose();
    } catch (error) {
      onError?.(error.message || "Failed to update bills");
    }
  };

  if (!isOpen) return null;

  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl w-full max-w-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Confirm Bulk Changes</h3>
              <button
                onClick={() => setShowConfirmation(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Summary of Changes</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>
                    • {summary.changedBills} of {summary.totalBills} bills will be updated
                  </p>
                  {summary.totalAmountChange !== 0 && (
                    <p>
                      • Net amount change: {summary.totalAmountChange > 0 ? "+" : ""}$
                      {summary.totalAmountChange.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2">
                {selectedBills.map((bill) => {
                  const change = changes[bill.id];
                  const hasAmountChange = change?.amount !== change?.originalAmount;
                  const hasDateChange = change?.dueDate !== change?.originalDueDate;

                  if (!hasAmountChange && !hasDateChange) return null;

                  return (
                    <div key={bill.id} className="bg-gray-50 p-3 rounded-lg">
                      <h5 className="font-medium text-gray-900">
                        {bill.provider || bill.description}
                      </h5>
                      <div className="text-sm text-gray-600 space-y-1 mt-1">
                        {hasAmountChange && (
                          <p>
                            Amount: ${Math.abs(change.originalAmount).toFixed(2)} → $
                            {Math.abs(change.amount).toFixed(2)}
                          </p>
                        )}
                        {hasDateChange && (
                          <p>
                            Due Date: {change.originalDueDate || "Not set"} →{" "}
                            {change.dueDate || "Not set"}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300"
                >
                  Back to Edit
                </button>
                <button
                  onClick={confirmChanges}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Bulk Update Bills</h3>
              <p className="text-sm text-gray-600 mt-1">
                Update amounts and due dates for {selectedBills.length} selected bills
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Update Mode Selector */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setUpdateMode("amounts")}
              className={`px-4 py-2 rounded-lg flex items-center ${
                updateMode === "amounts"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Amounts Only
            </button>
            <button
              onClick={() => setUpdateMode("dates")}
              className={`px-4 py-2 rounded-lg flex items-center ${
                updateMode === "dates"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Due Dates Only
            </button>
            <button
              onClick={() => setUpdateMode("both")}
              className={`px-4 py-2 rounded-lg flex items-center ${
                updateMode === "both"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Both
            </button>
          </div>

          {/* Bulk Actions */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Apply to All Selected Bills</h4>
            <div className="flex gap-3">
              {(updateMode === "amounts" || updateMode === "both") && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Set all amounts to..."
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-40"
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
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <input
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg text-sm"
              >
                <Undo2 className="h-4 w-4" />
                Reset All
              </button>
            </div>
          </div>

          {/* Bills List */}
          <div className="overflow-y-auto max-h-96">
            <div className="space-y-3">
              {selectedBills.map((bill) => {
                const change = changes[bill.id];
                const hasAmountChange = change?.amount !== change?.originalAmount;
                const hasDateChange = change?.dueDate !== change?.originalDueDate;

                return (
                  <div
                    key={bill.id}
                    className={`p-4 border rounded-lg ${
                      hasAmountChange || hasDateChange
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">
                          {bill.provider || bill.description}
                        </h5>
                        <p className="text-sm text-gray-600">{bill.category}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        {(updateMode === "amounts" || updateMode === "both") && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <input
                              type="number"
                              step="0.01"
                              value={Math.abs(change?.amount || 0)}
                              onChange={(e) =>
                                updateChange(bill.id, "amount", parseFloat(e.target.value) || 0)
                              }
                              className={`w-24 px-2 py-1 border rounded text-sm ${
                                hasAmountChange ? "border-blue-400 bg-white" : "border-gray-300"
                              }`}
                            />
                            {hasAmountChange && (
                              <span className="text-xs text-blue-600">
                                (was ${Math.abs(change.originalAmount).toFixed(2)})
                              </span>
                            )}
                          </div>
                        )}

                        {(updateMode === "dates" || updateMode === "both") && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <input
                              type="date"
                              value={change?.dueDate || ""}
                              onChange={(e) => updateChange(bill.id, "dueDate", e.target.value)}
                              className={`px-2 py-1 border rounded text-sm ${
                                hasDateChange ? "border-blue-400 bg-white" : "border-gray-300"
                              }`}
                            />
                          </div>
                        )}

                        {(hasAmountChange || hasDateChange) && (
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary and Actions */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {summary.hasChanges ? (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    {summary.changedBills} bills have changes
                    {summary.totalAmountChange !== 0 && (
                      <span className="ml-2">
                        (Net: {summary.totalAmountChange > 0 ? "+" : ""}$
                        {summary.totalAmountChange.toFixed(2)})
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    No changes made yet
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!summary.hasChanges}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Update {summary.changedBills} Bills
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkBillUpdateModal;
