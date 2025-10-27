import { useState, useCallback } from "react";
import { create } from "zustand";
import logger from "../../utils/common/logger";

interface ConfirmConfig {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  icon?: string | null;
  onConfirm?: () => Promise<void> | void;
}

interface ConfirmStore {
  isOpen: boolean;
  config: ConfirmConfig;
  resolver: ((value: boolean) => void) | null;
  showConfirm: (config: ConfirmConfig, resolver: (value: boolean) => void) => void;
  hideConfirm: () => void;
}

/**
 * Zustand store for managing confirm modal state
 * Part of Epic #501 - Replace Browser Dialogs with Modals & Standardize Notifications to Toasts
 * Addresses Issue #502 - Replace Confirms with ConfirmModal
 */
const useConfirmStore = create<ConfirmStore>((set) => ({
  isOpen: false,
  config: {},
  resolver: null,

  showConfirm: (config: ConfirmConfig, resolver: (value: boolean) => void) => set({ isOpen: true, config, resolver }),

  hideConfirm: () => set({ isOpen: false, config: {}, resolver: null }),
}));

/**
 * useConfirm Hook - Promise-based API for confirm dialogs
 *
 * Usage:
 * const confirm = useConfirm();
 * const confirmed = await confirm({
 *   title: "Delete Item",
 *   message: "Are you sure you want to delete this item?",
 *   destructive: true
 * });
 *
 * if (confirmed) {
 *   // User confirmed
 * }
 */
export const useConfirm = () => {
  const showConfirm = useConfirmStore((state) => state.showConfirm);

  const confirm = useCallback(
    (config: ConfirmConfig = {}): Promise<boolean> => {
      return new Promise((resolve) => {
        const finalConfig: ConfirmConfig = {
          title: "Confirm Action",
          message: "Are you sure you want to continue?",
          confirmLabel: "Confirm",
          cancelLabel: "Cancel",
          destructive: false,
          icon: null,
          ...config,
        };

        showConfirm(finalConfig, resolve);
      });
    },
    [showConfirm]
  );

  return confirm;
};

/**
 * ConfirmProvider - Component that renders the modal
 * Should be placed once at the app root level
 */
export const useConfirmModal = () => {
  const isOpen = useConfirmStore((state) => state.isOpen);
  const config = useConfirmStore((state) => state.config);
  const resolver = useConfirmStore((state) => state.resolver);
  const hideConfirm = useConfirmStore((state) => state.hideConfirm);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = useCallback(async () => {
    if (!resolver) return;

    // Handle async confirmation if needed
    if (config.onConfirm) {
      setIsLoading(true);
      try {
        await config.onConfirm();
        resolver(true);
      } catch (error) {
        logger.error("Confirmation action failed:", error);
        resolver(false);
      } finally {
        setIsLoading(false);
      }
    } else {
      resolver(true);
    }

    hideConfirm();
  }, [resolver, config, hideConfirm]);

  const handleCancel = useCallback(() => {
    if (!resolver) return;
    resolver(false);
    hideConfirm();
  }, [resolver, hideConfirm]);

  return {
    isOpen,
    config,
    isLoading,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  };
};
