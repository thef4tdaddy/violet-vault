import { create } from "zustand";
import { persist } from "zustand/middleware";
import logger from "../../utils/common/logger";

/**
 * Onboarding Store - Tracks user onboarding progress and tutorial state
 */
const useOnboardingStore = create(
  persist(
    (set, _get) => {
      const store = {
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

          set((state) => {
            const newTutorialProgress = {
              ...state.tutorialProgress,
              [step]: true,
            };

            // Check if all steps are complete
            const allStepsComplete = Object.values(newTutorialProgress).every(Boolean);

            if (allStepsComplete) {
              // Auto-complete onboarding if all steps are done
              return {
                tutorialProgress: newTutorialProgress,
                isOnboarded: true,
                currentTutorialStep: null,
                preferences: {
                  ...state.preferences,
                  tourCompleted: true,
                },
              };
            }

            return {
              tutorialProgress: newTutorialProgress,
            };
          });
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
          set((state) => ({
            isOnboarded: true,
            currentTutorialStep: null,
            preferences: {
              ...state.preferences,
              tourCompleted: true,
            },
          }));
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
      };

      return store;
    },
    {
      name: "violet-vault-onboarding",
      version: 1,
    }
  )
);

/**
 * Helper functions for onboarding store (external to avoid get() calls)
 */
export const onboardingHelpers = {
  /**
   * Check if a tutorial step is complete
   */
  isStepComplete: (step) => {
    const state = useOnboardingStore.getState();
    return state.tutorialProgress[step] || false;
  },

  /**
   * Check if a hint should be shown for a step
   */
  shouldShowHint: (step) => {
    const { preferences, tutorialProgress, isOnboarded } = useOnboardingStore.getState();
    return preferences.showHints && !isOnboarded && !tutorialProgress[step];
  },

  /**
   * Get onboarding progress statistics
   */
  getProgress: () => {
    const { tutorialProgress } = useOnboardingStore.getState();
    const completedSteps = Object.values(tutorialProgress).filter(Boolean).length;
    const totalSteps = Object.keys(tutorialProgress).length;
    return {
      completed: completedSteps,
      total: totalSteps,
      percentage: Math.round((completedSteps / totalSteps) * 100),
    };
  },
};

export default useOnboardingStore;
