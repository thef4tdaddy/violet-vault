import React, { useState, useMemo, useEffect } from "react";
import BaseModal from "@/components/primitives/modals/BaseModal";
import { useBulkBillUpdate } from "../../hooks/budgeting/transactions/scheduled/expenses/useBulkBillUpdate";
import {
  calculateUpdateSummary,
  transformBillsForUpdate,
} from "../../utils/bills/billUpdateHelpers";
import BulkUpdateConfirmModal from "./modals/BulkUpdateConfirmModal";
import BulkUpdateEditor from "./BulkUpdateEditor";
import BulkUpdateModeSelector from "./BulkUpdateModeSelector";
import BulkUpdateSummary from "./BulkUpdateSummary";
import type { Bill } from "@/types/bills";

interface BulkBillUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBills?: Bill[];
  onUpdateBills: (bills: Bill[]) => Promise<void>;
  onError?: (error: string) => void;
}

/**
 * BulkBillUpdateModal - Migrated to use BaseModal primitive (Issue #1594)
 *
 * Allows bulk editing of bill amounts and due dates
 */
const BulkBillUpdateModal: React.FC<BulkBillUpdateModalProps> = ({
  isOpen,
  onClose,
  selectedBills = [],
  onUpdateBills,
  onError,
}) => {
  const [updateMode, setUpdateMode] = useState<"amounts" | "dates" | "both">("amounts");
  const titleId = React.useId();

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
      await onUpdateBills(updatedBills as Bill[]);
      onClose();
    } catch (error) {
      onError?.((error as Error)?.message || "Failed to update bills");
    }
  };

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

      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        ariaLabelledBy={titleId}
        showCloseButton={true}
      >
        <div className="p-6 max-h-[90vh] overflow-y-auto">
          <div className="mb-6">
            <h3 id={titleId} className="text-lg font-black text-black">
              BULK UPDATE BILLS
            </h3>
            <p className="text-sm text-purple-800 mt-1 font-medium">
              Update amounts and due dates for {selectedBills.length} selected bills
            </p>
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
      </BaseModal>
    </>
  );
};

export default BulkBillUpdateModal;
