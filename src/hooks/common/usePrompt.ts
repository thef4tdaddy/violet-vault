import React, { useState, useCallback } from "react";
import { create } from "zustand";
import logger from "../../utils/common/logger";

interface PromptConfig {
  title?: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  inputType?: string;
  isRequired?: boolean;
  validation?: ((value: string) => { valid: boolean; error?: string }) | null;
  icon?: string | null;
  onConfirm?: (value: string) => Promise<string | void> | string | void;
  children?: React.ReactNode;
}

interface PromptStore {
  isOpen: boolean;
  config: PromptConfig;
  resolver: ((value: string | null) => void) | null;
  showPrompt: (config: PromptConfig, resolver: (value: string | null) => void) => void;
  hidePrompt: () => void;
}

/**
 * Zustand store for managing prompt modal state
 * Part of Epic #501 - Replace Browser Dialogs with Modals & Standardize Notifications to Toasts
 * Addresses Issue #504 - Replace Prompts with PromptModal
 */
const usePromptStore = create<PromptStore>((set) => ({
  isOpen: false,
  config: {},
  resolver: null,

  showPrompt: (config: PromptConfig, resolver: (value: string | null) => void) =>
    set({ isOpen: true, config, resolver }),

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
  const showPrompt = usePromptStore((state) => state.showPrompt);

  const prompt = useCallback(
    (config: PromptConfig = {}): Promise<string | null> => {
      return new Promise((resolve) => {
        const finalConfig: PromptConfig = {
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
    [showPrompt]
  );

  return prompt;
};

/**
 * PromptProvider - Component that renders the modal
 * Should be placed once at the app root level
 */
export const usePromptModal = () => {
  const isOpen = usePromptStore((state) => state.isOpen);
  const config = usePromptStore((state) => state.config);
  const resolver = usePromptStore((state) => state.resolver);
  const hidePrompt = usePromptStore((state) => state.hidePrompt);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = useCallback(
    async (value: string) => {
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
    [resolver, config, hidePrompt]
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
