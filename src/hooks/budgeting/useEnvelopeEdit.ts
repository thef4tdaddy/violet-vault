import { useEffect } from "react";
import { useAuthManager } from "../auth/useAuthManager";
import useEditLock from "../common/useEditLock";
import { initializeEditLocks } from "../../services/editLockService";
import useEnvelopeForm from "./useEnvelopeForm";

/**
 * Custom hook for editing envelopes with edit locking support
 * Combines envelope form management with edit locking functionality
 */
const useEnvelopeEdit = ({
  isOpen = false,
  envelope = null,
  existingEnvelopes = [],
  onSave,
  onClose,
  onDelete,
  currentUser = { userName: "User" },
}) => {
  // Get auth context for edit locking
  const {
    securityContext: { budgetId },
    user: authCurrentUser,
  } = useAuthManager();

  // Initialize edit lock service when modal opens
  useEffect(() => {
    if (isOpen && budgetId && authCurrentUser) {
      initializeEditLocks(budgetId, authCurrentUser);
    }
  }, [isOpen, budgetId, authCurrentUser]);

  // Edit locking for the envelope
  const {
    lock,
    isLocked,
    isOwnLock,
    canEdit,
    lockedBy,
    expiresAt,
    timeRemaining,
    isExpired,
    releaseLock,
    breakLock,
    isLoading: lockLoading,
  } = useEditLock("envelope", envelope?.id, {
    autoAcquire: isOpen && envelope?.id,
    autoRelease: true,
    showToasts: true,
  });

  // Enhanced close handler that releases locks
  const handleClose = () => {
    if (isOwnLock) {
      releaseLock();
    }
    onClose();
  };

  // Enhanced save handler that manages locks
  const handleSave = async (envelopeData: unknown) => {
    // Check if we can edit before saving
    if (envelope && !canEdit) {
      throw new Error("Cannot save changes - envelope is locked by another user");
    }

    await onSave(envelopeData);

    // Release lock after successful save
    if (isOwnLock && envelope) {
      releaseLock();
    }
  };

  // Enhanced delete handler with lock management
  const handleDelete = async () => {
    if (!canEdit) {
      throw new Error("Cannot delete envelope - it is locked by another user");
    }

    await onDelete(envelope.id);

    // Lock will be automatically released when envelope is deleted
    return true;
  };

  // Use envelope form hook with enhanced handlers
  const formHook = useEnvelopeForm({
    envelope,
    existingEnvelopes,
    onSave: handleSave,
    onClose: handleClose,
    currentUser,
  });

  return {
    // Form state and actions from useEnvelopeForm
    ...formHook,

    // Edit lock state
    lock,
    isLocked,
    isOwnLock,
    canEdit,
    lockedBy,
    expiresAt,
    timeRemaining,
    isExpired,
    lockLoading,

    // Enhanced actions with lock management
    handleClose,
    handleDelete,
    releaseLock,
    breakLock,

    // Lock utilities
    canDelete: canEdit && Boolean(envelope),
    canSave: formHook.canSubmit && canEdit,
    isReadOnly: Boolean(envelope && !canEdit),
  };
};

export default useEnvelopeEdit;
