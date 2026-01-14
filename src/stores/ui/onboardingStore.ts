import { create } from "zustand";
import { persist } from "zustand/middleware";
import logger from "@/utils/common/logger";

interface OnboardingState {
  isOnboarded: boolean;
  tutorialProgress: Record<string, boolean>;
  currentTutorialStep: string | null;
  preferences: {
    showHints: boolean;
    skipEmptyStateHelp: boolean;
    tourCompleted: boolean;
  };
  markStepComplete: (step: string) => void;
  startTutorialStep: (step: string) => void;
  endTutorialStep: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setPreference: (key: string, value: unknown) => void;
  isStepComplete: (step: string) => boolean;
  shouldShowHint: (step: string) => boolean;
  getProgress: () => { completed: number; total: number; percentage: number };
}

/**
 * 🚨 TEMPORARILY SIMPLIFIED Onboarding Store
 * Minimal implementation to prevent React error #185 while we implement proper architecture
 * This removes all get() calls that were causing infinite render loops
 */
const useOnboardingStore = create<OnboardingState>()(
  persist(
    (_set, _get) => ({
      // Onboarding completion status
      isOnboarded: true, // 🚨 TEMP: Set to true to skip onboarding functionality

      // Tutorial progress tracking (simplified)
      tutorialProgress: {
        accountSetup: true,
        firstBankBalance: true,
        firstPaycheck: true,
        firstDebts: true,
        firstBills: true,
        firstEnvelope: true,
        linkedEnvelopes: true,
        firstAllocation: true,
        firstTransaction: true,
        syncExplained: true,
      },

      // Current tutorial step (null when not in tutorial)
      currentTutorialStep: null,

      // Tutorial preferences
      preferences: {
        showHints: false, // 🚨 TEMP: Disable hints
        skipEmptyStateHelp: true, // 🚨 TEMP: Skip help
        tourCompleted: true, // 🚨 TEMP: Mark as completed
      },

      // 🚨 SIMPLIFIED ACTIONS - No get() calls
      markStepComplete: (step) => {
        logger.info(`✅ Onboarding step completed: ${step} (TEMP DISABLED)`);
        // Do nothing - onboarding disabled
      },

      startTutorialStep: (step) => {
        logger.info(`🎯 Starting tutorial step: ${step} (TEMP DISABLED)`);
        // Do nothing - onboarding disabled
      },

      endTutorialStep: () => {
        // Do nothing - onboarding disabled
      },

      completeOnboarding: () => {
        logger.info("🎉 Onboarding completed! (TEMP DISABLED)");
        // Do nothing - onboarding disabled
      },

      resetOnboarding: () => {
        logger.info("🔄 Resetting onboarding progress (TEMP DISABLED)");
        // Do nothing - onboarding disabled
      },

      setPreference: (key, value) => {
        logger.info(`Setting preference ${key} = ${value} (TEMP DISABLED)`);
        // Do nothing - onboarding disabled
      },

      // 🚨 TEMP: Simplified helper methods that don't use get()
      isStepComplete: (_step) => {
        return true; // All steps "complete"
      },

      shouldShowHint: (_step) => {
        return false; // No hints
      },

      getProgress: () => {
        return {
          completed: 10,
          total: 10,
          percentage: 100,
        };
      },
    }),
    {
      name: "violet-vault-onboarding",
      version: 1,
    }
  )
);

export default useOnboardingStore;
