import React, { useState, useMemo, useEffect } from "react";
import { useBulkBillUpdate } from "../../hooks/budgeting/transactions/scheduled/expenses/useBulkBillUpdate";
import {
  calculateUpdateSummary,
  transformBillsForUpdate,
} from "@/utils/domain/bills/billUpdateHelpers";
import BulkUpdateConfirmModal from "./modals/BulkUpdateConfirmModal";
import BulkUpdateEditor from "./BulkUpdateEditor";
import BulkUpdateModeSelector from "./BulkUpdateModeSelector";
import BulkUpdateSummary from "./BulkUpdateSummary";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { useModalAutoScroll } from "@/hooks/platform/ux/useModalAutoScroll";
import type { Bill } from "@/types/bills";

interface BulkBillUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBills?: Bill[];
  onUpdateBills: (bills: Bill[]) => Promise<void>;
  onError?: (error: string) => void;
}

const BulkBillUpdateModal: React.FC<BulkBillUpdateModalProps> = ({
  isOpen,
  onClose,
  selectedBills = [],
  onUpdateBills,
  onError,
}) => {
  const [updateMode, setUpdateMode] = useState<"amounts" | "dates" | "both">("amounts");

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

  const modalRef = useModalAutoScroll(isOpen);

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
      await onUpdateBills(updatedBills as Bill[]);
      onClose();
    } catch (error) {
      onError?.((error as Error)?.message || "Failed to update bills");
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div
            ref={modalRef}
            className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl border-2 border-black my-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-black">BULK UPDATE BILLS</h3>
                  <p className="text-sm text-purple-800 mt-1 font-medium">
                    Update amounts and due dates for {selectedBills.length} selected bills
                  </p>
                </div>
                <ModalCloseButton onClick={onClose} />
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
              <BulkUpdateSummary summary={summary} onClose={onClose} handleSubmit={handleSubmit} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkBillUpdateModal;
