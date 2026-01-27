import { create } from "zustand";

/**
 * Import Dashboard Modal State
 * Manages the open/close state and preloaded file for the import dashboard modal
 */
interface ImportDashboardStore {
  /**
   * Whether the modal is currently open
   */
  isOpen: boolean;

  /**
   * Optional file that was preloaded (e.g., from PWA share target)
   */
  preloadedFile: File | null;

  /**
   * Open the import dashboard modal
   * @param options - Optional configuration
   * @param options.preloadFile - File to preload for immediate processing
   */
  open: (options?: { preloadFile?: File }) => void;

  /**
   * Close the import dashboard modal and reset state
   */
  close: () => void;
}

/**
 * Zustand store for import dashboard modal state
 * Used to control modal visibility and preloaded files from anywhere in the app
 */
export const useImportDashboardStore = create<ImportDashboardStore>((set) => ({
  isOpen: false,
  preloadedFile: null,

  open: (options) => {
    set({
      isOpen: true,
      preloadedFile: options?.preloadFile || null,
    });
  },

  close: () => {
    set({
      isOpen: false,
      preloadedFile: null,
    });
  },
}));
