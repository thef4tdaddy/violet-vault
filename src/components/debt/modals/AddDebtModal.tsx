import { useState, useEffect } from "react";
import { useDebtModalLogic } from "@/hooks/budgeting/envelopes/liabilities/useDebtModalLogic";
import EditLockIndicator from "../../ui/EditLockIndicator";
import DebtModalHeader from "./DebtModalHeader";
import DebtFormFields from "./DebtFormFields";
import { useModalAutoScroll } from "@/hooks/platform/ux/useModalAutoScroll";
import type { DebtAccount } from "@/types/debt";
import type { DebtSubmissionData } from "@/hooks/budgeting/envelopes/liabilities/useDebtForm";

interface AddDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DebtSubmissionData | string, updateData?: DebtSubmissionData) => Promise<void>;
  debt?: DebtAccount | null;
}

/**
 * Pure UI component for debt modal - ALL logic extracted to useDebtModalLogic hook
 * Refactored to use standardized shared components and extracted UI sections
 */
const AddDebtModal = ({ isOpen, onClose, onSubmit, debt = null }: AddDebtModalProps) => {
  const modalRef = useModalAutoScroll(isOpen);

  const {
    formData,
    setFormData,
    errors,
    isSubmitting,
    isEditMode,
    editLock,
    bills,
    billsLoading,
    canEdit,
    handleFormSubmit,
    handleClose,
  } = useDebtModalLogic(debt, isOpen, onSubmit, onClose);

  // Compute lock data with current timestamp in effect to avoid impure function in render
  const [lockData, setLockData] = useState({
    userName: "",
    expiresAt: new Date(),
    isExpired: false,
  });

  useEffect(() => {
    setLockData({
      userName: editLock.lockedBy ?? "",
      expiresAt: new Date(Date.now() + (editLock.timeRemaining || 0)),
      isExpired: editLock.isExpired,
    });
  }, [editLock.lockedBy, editLock.timeRemaining, editLock.isExpired]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-black my-auto"
      >
        <DebtModalHeader isEditMode={isEditMode} onClose={handleClose} />

        {/* Standardized Edit Lock Indicator */}
        {(editLock.shouldShowEditLockWarning || editLock.shouldShowOwnLockIndicator) && (
          <div className="mb-6">
            <EditLockIndicator
              isLocked={editLock.shouldShowEditLockWarning}
              isOwnLock={editLock.shouldShowOwnLockIndicator}
              lock={lockData}
              onBreakLock={editLock.breakLock}
              showDetails={true}
            />
          </div>
        )}

        <DebtFormFields
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          canEdit={canEdit}
          isEditMode={isEditMode}
          isSubmitting={isSubmitting}
          handleFormSubmit={handleFormSubmit}
          onClose={onClose}
          bills={bills}
          billsLoading={billsLoading}
        />
      </div>
    </div>
  );
};

export default AddDebtModal;
