import React from "react";
import PromptModal from "./PromptModal";
import { usePromptModal } from "../../hooks/common/usePrompt";

/**
 * PromptProvider - Global provider for prompt modals
 *
 * Part of Epic #501 - Replace Browser Dialogs with Modals & Standardize Notifications to Toasts
 * Addresses Issue #504 - Replace Prompts with PromptModal
 *
 * Should be placed once at the app root level to enable usePrompt hook throughout the app
 */
const PromptProvider = () => {
  const { isOpen, config, isLoading, onConfirm, onCancel } = usePromptModal();

  return (
    <PromptModal
      isOpen={isOpen}
      title={config.title}
      message={config.message}
      placeholder={config.placeholder}
      defaultValue={config.defaultValue}
      confirmLabel={config.confirmLabel}
      cancelLabel={config.cancelLabel}
      inputType={config.inputType}
      isRequired={config.isRequired}
      validation={
        config.validation as ((value: string) => { valid: boolean; error: string }) | null
      }
      icon={config.icon as unknown as React.ComponentType<{ className?: string }> | null}
      isLoading={isLoading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      {config.children}
    </PromptModal>
  );
};

export default PromptProvider;
