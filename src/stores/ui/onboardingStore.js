import { create } from "zustand";
import { persist } from "zustand/middleware";
import logger from "../../utils/common/logger";

/**
 * Onboarding Store - Tracks user onboarding progress and tutorial state
 */
const useOnboardingStore = create(
  persist(
    (set, get) => ({
      // Onboarding completion status
      isOnboarded: false,

      // Tutorial progress tracking
      tutorialProgress: {
        accountSetup: false,
        firstBankBalance: false,
        firstPaycheck: false,
        firstDebts: false,
        firstBills: false,
        firstEnvelope: false,
        linkedEnvelopes: false,
        firstAllocation: false,
        firstTransaction: false,
        syncExplained: false,
      },

      // Current tutorial step (null when not in tutorial)
      currentTutorialStep: null,

      // Tutorial preferences
      preferences: {
        showHints: true,
        skipEmptyStateHelp: false,
        tourCompleted: false,
      },

      // Actions
      markStepComplete: (step) => {
        logger.info(`✅ Onboarding step completed: ${step}`);
        set((state) => ({
          tutorialProgress: {
            ...state.tutorialProgress,
            [step]: true,
          },
        }));

        // Check if all steps are complete
        const { tutorialProgress } = get();
        const allStepsComplete = Object.values(tutorialProgress).every(Boolean);

        if (allStepsComplete) {
          get().completeOnboarding();
        }
      },

      startTutorialStep: (step) => {
        logger.info(`🎯 Starting tutorial step: ${step}`);
        set({ currentTutorialStep: step });
      },

      endTutorialStep: () => {
        set({ currentTutorialStep: null });
      },

      completeOnboarding: () => {
        logger.info("🎉 Onboarding completed!");
        set({
          isOnboarded: true,
          currentTutorialStep: null,
          preferences: {
            ...get().preferences,
            tourCompleted: true,
          },
        });
      },

      resetOnboarding: () => {
        logger.info("🔄 Resetting onboarding progress");
        set({
          isOnboarded: false,
          tutorialProgress: {
            accountSetup: false,
            firstBankBalance: false,
            firstPaycheck: false,
            firstDebts: false,
            firstBills: false,
            firstEnvelope: false,
            linkedEnvelopes: false,
            firstAllocation: false,
            firstTransaction: false,
            syncExplained: false,
          },
          currentTutorialStep: null,
          preferences: {
            showHints: true,
            skipEmptyStateHelp: false,
            tourCompleted: false,
          },
        });
      },

      setPreference: (key, value) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            [key]: value,
          },
        }));
      },

      // Helper methods
      isStepComplete: (step) => {
        return get().tutorialProgress[step] || false;
      },

      shouldShowHint: (step) => {
        const { preferences, tutorialProgress, isOnboarded } = get();
        return preferences.showHints && !isOnboarded && !tutorialProgress[step];
      },

      getProgress: () => {
        const { tutorialProgress } = get();
        const completedSteps =
          Object.values(tutorialProgress).filter(Boolean).length;
        const totalSteps = Object.keys(tutorialProgress).length;
        return {
          completed: completedSteps,
          total: totalSteps,
          percentage: Math.round((completedSteps / totalSteps) * 100),
        };
      },
    }),
    {
      name: "violet-vault-onboarding",
      version: 1,
    },
  ),
);

export default useOnboardingStore;
