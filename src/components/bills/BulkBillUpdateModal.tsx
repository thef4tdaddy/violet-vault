import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../utils";
import { useBulkBillUpdate } from "../../hooks/bills/useBulkBillUpdate";
import {
  calculateUpdateSummary,
  transformBillsForUpdate,
} from "../../utils/bills/billUpdateHelpers";
import BulkUpdateConfirmModal from "./modals/BulkUpdateConfirmModal";
import BulkUpdateEditor from "./BulkUpdateEditor";

const BulkBillUpdateModal = ({ isOpen, onClose, selectedBills = [], onUpdateBills, onError }) => {
  const [updateMode, setUpdateMode] = useState("amounts");

  const {
    changes,
    showConfirmation,
    setShowConfirmation,
    initializeChanges,
    updateChange,
    applyBulkChange,
    resetChanges,
  } = useBulkBillUpdate(selectedBills, isOpen);

  // Initialize changes when modal opens
  useEffect(() => {
    if (isOpen) {
      initializeChanges();
    }
  }, [isOpen, selectedBills, initializeChanges]);

  const summary = useMemo(
    () => calculateUpdateSummary(selectedBills, changes),
    [selectedBills, changes]
  );

  const handleSubmit = () => {
    if (!summary.hasChanges) {
      onError?.("No changes to apply");
      return;
    }
    setShowConfirmation(true);
  };

  const confirmChanges = async () => {
    try {
      const updatedBills = transformBillsForUpdate(selectedBills, changes);
      await onUpdateBills(updatedBills);
      onClose();
    } catch (error) {
      onError?.(error.message || "Failed to update bills");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <BulkUpdateConfirmModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmChanges}
        selectedBills={selectedBills}
        changes={changes}
        summary={summary}
      />

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glassmorphism rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl border-2 border-black">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-black">BULK UPDATE BILLS</h3>
                  <p className="text-sm text-purple-800 mt-1 font-medium">
                    Update amounts and due dates for {selectedBills.length} selected bills
                  </p>
                </div>
                <Button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 glassmorphism backdrop-blur-sm rounded-full p-2 shadow-lg hover:shadow-xl transition-all border-2 border-black"
                >
                  {React.createElement(getIcon("X"), { className: "h-5 w-5" })}
                </Button>
              </div>

              {/* Update Mode Selector */}
              <div className="flex gap-2 mb-6">
                <Button
                  onClick={() => setUpdateMode("amounts")}
                  className={`px-4 py-2 rounded-lg flex items-center border-2 border-black shadow-md hover:shadow-lg transition-all font-bold ${
                    updateMode === "amounts"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                      : "bg-white/60 backdrop-blur-sm text-gray-700 hover:bg-white/80"
                  }`}
                >
                  {React.createElement(getIcon("DollarSign"), {
                    className: "h-4 w-4 mr-2",
                  })}
                  Amounts Only
                </Button>
                <Button
                  onClick={() => setUpdateMode("dates")}
                  className={`px-4 py-2 rounded-lg flex items-center border-2 border-black shadow-md hover:shadow-lg transition-all font-bold ${
                    updateMode === "dates"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                      : "bg-white/60 backdrop-blur-sm text-gray-700 hover:bg-white/80"
                  }`}
                >
                  {React.createElement(getIcon("Calendar"), {
                    className: "h-4 w-4 mr-2",
                  })}
                  Due Dates Only
                </Button>
                <Button
                  onClick={() => setUpdateMode("both")}
                  className={`px-4 py-2 rounded-lg flex items-center border-2 border-black shadow-md hover:shadow-lg transition-all font-bold ${
                    updateMode === "both"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                      : "bg-white/60 backdrop-blur-sm text-gray-700 hover:bg-white/80"
                  }`}
                >
                  {React.createElement(getIcon("Edit3"), {
                    className: "h-4 w-4 mr-2",
                  })}
                  Both
                </Button>
              </div>

              <BulkUpdateEditor
                selectedBills={selectedBills}
                changes={changes}
                updateMode={updateMode}
                updateChange={updateChange}
                applyBulkChange={applyBulkChange}
                resetChanges={resetChanges}
              />

              {/* Summary and Actions */}
              <div className="mt-6 pt-4 border-t-2 border-black">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-purple-800">
                    {summary.hasChanges ? (
                      <div className="flex items-center gap-2 glassmorphism backdrop-blur-sm px-3 py-2 rounded-lg border border-orange-200">
                        {React.createElement(getIcon("AlertTriangle"), {
                          className: "h-4 w-4 text-orange-600",
                        })}
                        <span className="font-bold">
                          {summary.changedBills} bills have changes
                          {summary.totalAmountChange !== 0 && (
                            <span className="ml-2 text-purple-900">
                              (Net: {summary.totalAmountChange > 0 ? "+" : ""}$
                              {summary.totalAmountChange.toFixed(2)})
                            </span>
                          )}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 glassmorphism backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-200">
                        {React.createElement(getIcon("Clock"), {
                          className: "h-4 w-4 text-gray-500",
                        })}
                        <span className="font-medium text-gray-600">No changes made yet</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={onClose}
                      className="px-4 py-2 text-gray-800 bg-gray-200/80 rounded-lg hover:bg-gray-300/80 transition-all border-2 border-black shadow-md hover:shadow-lg font-bold"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!summary.hasChanges}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all border-2 border-black shadow-md hover:shadow-lg font-black"
                    >
                      Update {summary.changedBills} Bills
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkBillUpdateModal;
