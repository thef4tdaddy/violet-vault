import { useState, useCallback } from "react";
import { create } from "zustand";
import logger from "../../utils/common/logger";

/**
 * Zustand store for managing prompt modal state
 * Part of Epic #501 - Replace Browser Dialogs with Modals & Standardize Notifications to Toasts
 * Addresses Issue #504 - Replace Prompts with PromptModal
 */
const usePromptStore = create((set) => ({
  isOpen: false,
  config: {},
  resolver: null,

  showPrompt: (config, resolver) => set({ isOpen: true, config, resolver }),

  hidePrompt: () => set({ isOpen: false, config: {}, resolver: null }),
}));

/**
 * usePrompt Hook - Promise-based API for prompt dialogs
 *
 * Usage:
 * const prompt = usePrompt();
 * const result = await prompt({
 *   title: "Enter Amount",
 *   message: "How much would you like to transfer?",
 *   inputType: "number",
 *   validation: (value) => {
 *     const num = parseFloat(value);
 *     if (isNaN(num) || num <= 0) {
 *       return { valid: false, error: "Please enter a valid positive number" };
 *     }
 *     return { valid: true };
 *   }
 * });
 *
 * if (result !== null) {
 *   // User confirmed, result contains the input value
 * } else {
 *   // User cancelled
 * }
 */
export const usePrompt = () => {
  const { showPrompt } = usePromptStore();

  const prompt = useCallback(
    (config = {}) => {
      return new Promise((resolve) => {
        const finalConfig = {
          title: "Enter Value",
          message: "Please enter a value:",
          placeholder: "",
          defaultValue: "",
          confirmLabel: "Confirm",
          cancelLabel: "Cancel",
          inputType: "text",
          isRequired: true,
          validation: null,
          icon: null,
          ...config,
        };

        showPrompt(finalConfig, resolve);
      });
    },
    [showPrompt],
  );

  return prompt;
};

/**
 * PromptProvider - Component that renders the modal
 * Should be placed once at the app root level
 */
export const usePromptModal = () => {
  const { isOpen, config, resolver, hidePrompt } = usePromptStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = useCallback(
    async (value) => {
      if (!resolver) return;

      // Handle async confirmation if needed
      if (config.onConfirm) {
        setIsLoading(true);
        try {
          const result = await config.onConfirm(value);
          resolver(result !== undefined ? result : value);
        } catch (error) {
          logger.error("Prompt confirmation action failed:", error);
          resolver(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        resolver(value);
      }

      hidePrompt();
    },
    [resolver, config, hidePrompt],
  );

  const handleCancel = useCallback(() => {
    if (!resolver) return;
    resolver(null);
    hidePrompt();
  }, [resolver, hidePrompt]);

  return {
    isOpen,
    config,
    isLoading,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  };
};
