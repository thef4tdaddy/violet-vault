import { useEffect } from "react";
import { useAuth } from "../auth/useAuth";
import useEditLock from "../common/useEditLock";
import { initializeEditLocks } from "@/services/sync/editLockService";
import useEnvelopeForm from "./useEnvelopeForm";

interface Envelope {
  id: string | number;
  name?: string;
  currentBalance?: number;
  [key: string]: unknown;
}

interface User {
  userName: string;
}

interface UseEnvelopeEditProps {
  isOpen?: boolean;
  envelope?: Envelope | null;
  existingEnvelopes?: Envelope[];
  onSave: (envelopeData: unknown) => Promise<void>;
  onClose: () => void;
  onDelete: (envelopeId: string | number) => Promise<void>;
  currentUser?: User;
}

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
}: UseEnvelopeEditProps) => {
  // Get auth context for edit locking
  const {
    securityContext: { budgetId },
    user: authCurrentUser,
  } = useAuth();

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
  } = useEditLock("envelope", envelope?.id != null ? String(envelope.id) : "", {
    autoAcquire: isOpen && envelope?.id != null,
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

    if (!envelope) {
      throw new Error("No envelope to delete");
    }

    await onDelete(envelope.id);

    // Lock will be automatically released when envelope is deleted
    return true;
  };

  // Use envelope form hook with enhanced handlers
  const formHook = useEnvelopeForm({
    envelope: envelope as unknown as Record<string, unknown> | null,
    existingEnvelopes: existingEnvelopes as unknown as Record<string, unknown>[],
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
