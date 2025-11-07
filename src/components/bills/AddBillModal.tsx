/**
 * AddBillModal Component - Refactored for Issue #152
 *
 * UI-only component using useBillForm hook for all business logic
 * Reduced from 923 LOC to ~350 LOC by extracting form logic
 * Enhanced with mobile slide-up functionality for Issue #164
 */
import { useEffect } from "react";
import { useBillForm } from "@/hooks/bills/useBillForm";
import useEditLock from "@/hooks/common/useEditLock";
import { useMobileDetection } from "@/hooks/ui/useMobileDetection";
// Edit locking managed through useEditLock hook, but service needs initialization
import { initializeEditLocks } from "@/services/editLockService";
import { useAuthManager } from "@/hooks/auth/useAuthManager";
import EditLockIndicator from "../ui/EditLockIndicator";
import BillModalHeader from "./BillModalHeader";
import BillFormFields from "./BillFormFields";
import SlideUpModal from "../mobile/SlideUpModal";
import { useModalAutoScroll } from "@/hooks/ui/useModalAutoScroll";

const AddBillModal = ({
  isOpen,
  onClose,
  onAddBill,
  onUpdateBill,
  onDeleteBill,
  onError,
  editingBill = null,
  _forceMobileMode = false, // Internal prop for testing
}) => {
  const isMobile = useMobileDetection();
  const modalRef = useModalAutoScroll(isOpen && !(isMobile || _forceMobileMode));
  // Use the extracted form logic hook
  const {
    // Form State
    formData,
    isSubmitting,

    // Computed Values
    suggestedIconName,
    iconSuggestions,
    categories,

    // Actions
    handleSubmit,
    updateField,
    resetForm,

    // Utility Functions
    calculateBiweeklyAmount,
    calculateMonthlyAmount,
    getNextDueDate,
  } = useBillForm({
    editingBill,
    onAddBill,
    onUpdateBill,
    onDeleteBill,
    onClose,
    onError,
  });

  // Get auth context for edit locking
  const {
    securityContext: { budgetId },
    user: currentUser,
  } = useAuthManager();

  // Initialize edit lock service when modal opens
  useEffect(() => {
    if (isOpen && budgetId && currentUser) {
      initializeEditLocks(budgetId, currentUser);
    }
  }, [isOpen, budgetId, currentUser]);

  // Edit locking for the bill (only when editing existing bill)
  const { isLocked, isOwnLock, canEdit, lock, breakLock } = useEditLock(
    editingBill ? "bill" : null,
    editingBill?.id || null,
    {
      autoAcquire: true,
      autoRelease: true,
      showToasts: true,
    }
  );

  // Lock management is now handled by useEditLock with autoAcquire/autoRelease

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resetForm is stable Zustand action
  }, [isOpen]);

  if (!isOpen) return null;

  const modalTitle = editingBill ? "Edit Bill" : "Add Bill";

  // Extract modal content for reuse between mobile and desktop
  const ModalContent = () => (
    <>
      {/* Edit Lock Indicator */}
      {editingBill && (isLocked || isOwnLock) && (
        <div className="px-6 py-3 border-b border-gray-200">
          <EditLockIndicator
            isLocked={isLocked}
            isOwnLock={isOwnLock}
            lock={lock}
            onBreakLock={breakLock}
            showDetails={true}
          />
        </div>
      )}

      <BillFormFields
        formData={formData}
        updateField={updateField}
        canEdit={canEdit}
        editingBill={editingBill}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onClose={onClose}
        suggestedIconName={suggestedIconName}
        iconSuggestions={iconSuggestions}
        categories={categories}
        calculateBiweeklyAmount={calculateBiweeklyAmount}
        calculateMonthlyAmount={calculateMonthlyAmount}
        getNextDueDate={getNextDueDate}
      />
    </>
  );

  // Mobile slide-up modal
  if (isMobile || _forceMobileMode) {
    return (
      <SlideUpModal
        isOpen={isOpen}
        onClose={onClose}
        title={modalTitle}
        height="auto"
        showHandle={true}
        backdrop={true}
      >
        <div className="pb-6">
          <ModalContent />
        </div>
      </SlideUpModal>
    );
  }

  // Desktop centered modal
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl my-auto border-2 border-black"
      >
        <BillModalHeader editingBill={editingBill} formData={formData} onClose={onClose} />
        <ModalContent />
      </div>
    </div>
  );
};

export default AddBillModal;
