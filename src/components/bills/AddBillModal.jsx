/**
 * AddBillModal Component - Refactored for Issue #152
 *
 * UI-only component using useBillForm hook for all business logic
 * Reduced from 923 LOC to ~350 LOC by extracting form logic
 * Enhanced with mobile slide-up functionality for Issue #164
 */
import React, { useEffect } from "react";
import { useBillForm } from "../../hooks/bills/useBillForm";
import useEditLock from "../../hooks/common/useEditLock";
import { useConfirm } from "../../hooks/common/useConfirm";
import { useMobileDetection } from "../../hooks/ui/useMobileDetection";
// Edit locking managed through useEditLock hook, but service needs initialization
// eslint-disable-next-line no-restricted-imports -- Required for edit lock service initialization
import { initializeEditLocks } from "../../services/editLockService";
import { useAuth } from "../../stores/auth/authStore";
import EditLockIndicator from "../ui/EditLockIndicator";
import BillModalHeader from "./BillModalHeader";
import BillFormFields from "./BillFormFields";
import SlideUpModal from "../mobile/SlideUpModal";

// eslint-disable-next-line max-lines-per-function -- Component orchestrates extracted components
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
  // Use the extracted form logic hook
  const {
    // Form State
    formData,
    deleteEnvelopeToo,
    isSubmitting,

    // Computed Values
    suggestedIconName,
    iconSuggestions,
    categories,

    // Actions
    handleSubmit,
    handleDelete,
    updateField,
    resetForm,

    // UI State Setters
    setDeleteEnvelopeToo,

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
  const { budgetId, currentUser } = useAuth();

  // Standardized confirmation modal
  const confirm = useConfirm();

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
    },
  );

  // Lock management is now handled by useEditLock with autoAcquire/autoRelease

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]); // resetForm is stable in Zustand

  // Custom delete handler using standardized confirm modal
  const handleDeleteClick = async () => {
    const deleteEnvelopeCheckbox = (
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="deleteEnvelope"
          checked={deleteEnvelopeToo}
          onChange={(e) => setDeleteEnvelopeToo(e.target.checked)}
          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
        />
        <label htmlFor="deleteEnvelope" className="ml-2 text-sm text-gray-700">
          Also delete associated envelope
        </label>
      </div>
    );

    const confirmed = await confirm({
      title: "Delete Bill",
      message: `Are you sure you want to delete "${editingBill?.name}"?`,
      confirmLabel: "Delete Bill",
      cancelLabel: "Cancel",
      destructive: true,
      children: deleteEnvelopeCheckbox,
    });

    if (confirmed) {
      handleDelete();
    }
  };

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
        onDeleteClick={handleDeleteClick}
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl">
        <BillModalHeader
          editingBill={editingBill}
          formData={formData}
          onClose={onClose}
        />
        <ModalContent />
      </div>
    </div>
  );
};

export default AddBillModal;
