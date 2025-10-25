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
import BulkUpdateModeSelector from "./BulkUpdateModeSelector";
import BulkUpdateSummary from "./BulkUpdateSummary";

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
              <BulkUpdateModeSelector updateMode={updateMode} setUpdateMode={setUpdateMode} />

              <BulkUpdateEditor
                selectedBills={selectedBills}
                changes={changes}
                updateMode={updateMode}
                updateChange={updateChange}
                applyBulkChange={applyBulkChange}
                resetChanges={resetChanges}
              />

              {/* Summary and Actions */}
              <BulkUpdateSummary
                summary={summary}
                onClose={onClose}
                handleSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkBillUpdateModal;
