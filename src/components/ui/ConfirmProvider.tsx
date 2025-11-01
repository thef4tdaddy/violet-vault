import React from "react";
import ConfirmModal from "./ConfirmModal";
import { useConfirmModal } from "../../hooks/common/useConfirm";

/**
 * ConfirmProvider - Global provider for confirm modals
 *
 * Part of Epic #501 - Replace Browser Dialogs with Modals & Standardize Notifications to Toasts
 * Addresses Issue #502 - Replace Confirms with ConfirmModal
 *
 * Should be placed once at the app root level to enable useConfirm hook throughout the app
 */
const ConfirmProvider = () => {
  const { isOpen, config, isLoading, onConfirm, onCancel } = useConfirmModal();

  return (
    <ConfirmModal
      isOpen={isOpen}
      title={config.title}
      message={config.message}
      confirmLabel={config.confirmLabel}
      cancelLabel={config.cancelLabel}
      destructive={config.destructive}
      icon={config.icon as unknown as React.ComponentType<{ className?: string }> | null}
      isLoading={isLoading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      {config.children}
    </ConfirmModal>
  );
};

export default ConfirmProvider;
