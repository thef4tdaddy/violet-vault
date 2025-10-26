import { useState, useEffect } from "react";
import { useDebtModalLogic } from "../../../hooks/debts/useDebtModalLogic";
import EditLockIndicator from "../../ui/EditLockIndicator";
import DebtModalHeader from "./DebtModalHeader";
import DebtFormFields from "./DebtFormFields";

/**
 * Pure UI component for debt modal - ALL logic extracted to useDebtModalLogic hook
 * Refactored to use standardized shared components and extracted UI sections
 */
const AddDebtModal = ({ isOpen, onClose, onSubmit, debt = null }) => {
  const {
    formData,
    setFormData,
    errors,
    isSubmitting,
    isEditMode,
    editLock,
    envelopes,
    bills,
    billsLoading,
    connectionData,
    shouldShowExistingConnections,
    debtMetrics,
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLockData({
      userName: editLock.lockedBy,
      expiresAt: new Date(Date.now() + (editLock.timeRemaining || 0)),
      isExpired: editLock.isExpired,
    });
  }, [editLock.lockedBy, editLock.timeRemaining, editLock.isExpired]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
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
          onClose={handleClose}
          envelopes={envelopes}
          bills={bills}
          billsLoading={billsLoading}
          connectionData={connectionData}
          shouldShowExistingConnections={shouldShowExistingConnections}
          debtMetrics={debtMetrics}
        />
      </div>
    </div>
  );
};

export default AddDebtModal;
