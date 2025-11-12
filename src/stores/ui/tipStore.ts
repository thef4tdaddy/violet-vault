import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TipPreferencesSchema, type TipPreferences } from "@/domain/schemas/tip";
import { tipService } from "@/services/tipService";
import logger from "@/utils/common/logger";

interface TipState {
  preferences: TipPreferences;
  currentDisplayedTip: string | null;

  // Actions
  setTipsEnabled: (enabled: boolean) => void;
  markTipViewed: (tipId: string) => void;
  dismissTip: (tipId: string) => void;
  undismissTip: (tipId: string) => void;
  updateUserMaturityScore: (score: number) => void;
  setCurrentDisplayedTip: (tipId: string | null) => void;
  resetPreferences: () => void;

  // Helper methods
  isTipDismissed: (tipId: string) => boolean;
  isTipViewed: (tipId: string) => boolean;
}

/**
 * Zustand store for tip UI state and preferences
 * Manages user preferences for tips and tracks tip display state
 */
const useTipStore = create<TipState>()(
  persist(
    (set, get) => ({
      // Initial state
      preferences: tipService.getDefaultPreferences(),
      currentDisplayedTip: null,

      // Actions
      setTipsEnabled: (enabled) => {
        try {
          set((state) => ({
            preferences: {
              ...state.preferences,
              tipsEnabled: enabled,
            },
          }));
          logger.info(`Tips ${enabled ? "enabled" : "disabled"}`);
        } catch (error) {
          logger.error("Error setting tips enabled", error);
        }
      },

      markTipViewed: (tipId) => {
        try {
          const currentPreferences = get().preferences;
          const updatedPreferences = tipService.markTipViewed(currentPreferences, tipId);
          set({ preferences: updatedPreferences });
          logger.info(`Tip viewed: ${tipId}`);
        } catch (error) {
          logger.error("Error marking tip as viewed", error);
        }
      },

      dismissTip: (tipId) => {
        try {
          const currentPreferences = get().preferences;
          const updatedPreferences = tipService.dismissTip(currentPreferences, tipId);
          set({ preferences: updatedPreferences });
          logger.info(`Tip dismissed: ${tipId}`);
        } catch (error) {
          logger.error("Error dismissing tip", error);
        }
      },

      undismissTip: (tipId) => {
        try {
          const currentPreferences = get().preferences;
          const updatedPreferences = tipService.undismissTip(currentPreferences, tipId);
          set({ preferences: updatedPreferences });
          logger.info(`Tip undismissed: ${tipId}`);
        } catch (error) {
          logger.error("Error undismissing tip", error);
        }
      },

      updateUserMaturityScore: (score) => {
        try {
          set((state) => ({
            preferences: {
              ...state.preferences,
              userMaturityScore: Math.min(100, Math.max(0, score)),
            },
          }));
          logger.info(`User maturity score updated: ${score}`);
        } catch (error) {
          logger.error("Error updating user maturity score", error);
        }
      },

      setCurrentDisplayedTip: (tipId) => {
        set({ currentDisplayedTip: tipId });
      },

      resetPreferences: () => {
        try {
          set({ preferences: tipService.getDefaultPreferences() });
          logger.info("Tip preferences reset");
        } catch (error) {
          logger.error("Error resetting tip preferences", error);
        }
      },

      // Helper methods
      isTipDismissed: (tipId) => {
        return get().preferences.dismissedTips.includes(tipId);
      },

      isTipViewed: (tipId) => {
        return get().preferences.viewedTips.includes(tipId);
      },
    }),
    {
      name: "violet-vault-tips",
      version: 1,
      // Validate stored data on load
      migrate: (persistedState: unknown, version: number) => {
        try {
          if (version === 1) {
            const state = persistedState as TipState;
            // Validate preferences with Zod
            const validatedPreferences = TipPreferencesSchema.parse(state.preferences);
            return {
              ...state,
              preferences: validatedPreferences,
            };
          }
          return persistedState as TipState;
        } catch (error) {
          logger.error("Error migrating tip store", error);
          // Return default state on migration error
          return {
            preferences: tipService.getDefaultPreferences(),
            currentDisplayedTip: null,
          } as TipState;
        }
      },
    }
  )
);

export default useTipStore;
