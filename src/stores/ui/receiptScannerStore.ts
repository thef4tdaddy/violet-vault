import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Receipt Scanner Store
 * Manages UI state and user preferences for receipt scanning
 * Following ChastityOS v4.0.0: Zustand for UI state only
 */

interface ReceiptScannerState {
  // Privacy preferences
  saveRawText: boolean;
  encryptReceipts: boolean;

  // UI state
  showConfidenceIndicators: boolean;
  lastScanTimestamp: number | null;

  // Performance metrics
  lastProcessingTime: number | null;
  averageProcessingTime: number | null;

  // Actions
  setSaveRawText: (save: boolean) => void;
  setEncryptReceipts: (encrypt: boolean) => void;
  setShowConfidenceIndicators: (show: boolean) => void;
  recordScan: (processingTime: number) => void;
  resetPreferences: () => void;
}

const defaultState = {
  saveRawText: false, // Default: don't save raw OCR text for privacy
  encryptReceipts: true, // Default: encrypt receipt data when synced
  showConfidenceIndicators: true,
  lastScanTimestamp: null,
  lastProcessingTime: null,
  averageProcessingTime: null,
};

export const useReceiptScannerStore = create<ReceiptScannerState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      setSaveRawText: (save: boolean) => set({ saveRawText: save }),

      setEncryptReceipts: (encrypt: boolean) => set({ encryptReceipts: encrypt }),

      setShowConfidenceIndicators: (show: boolean) => set({ showConfidenceIndicators: show }),

      recordScan: (processingTime: number) => {
        const currentAverage = get().averageProcessingTime;
        const newAverage = currentAverage ? (currentAverage + processingTime) / 2 : processingTime;

        set({
          lastScanTimestamp: Date.now(),
          lastProcessingTime: processingTime,
          averageProcessingTime: newAverage,
        });
      },

      resetPreferences: () => set(defaultState),
    }),
    {
      name: "receipt-scanner-preferences",
      // Only persist user preferences, not transient state
      partialize: (state) => ({
        saveRawText: state.saveRawText,
        encryptReceipts: state.encryptReceipts,
        showConfidenceIndicators: state.showConfidenceIndicators,
      }),
    }
  )
);
