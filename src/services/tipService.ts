import { TIP_CONFIGS, getTipsByContext, getTipById } from "@/constants/tips";
import {
  TipContext,
  type TipConfig,
  type TipPreferences,
  TipPreferencesSchema,
} from "@/domain/schemas/tip";
import logger from "@/utils/common/logger";

/**
 * User state interface for condition checking
 */
interface UserState {
  hasEnvelopes: boolean;
  hasTransactions: boolean;
  hasDebts: boolean;
  hasBills: boolean;
  hasPaychecks: boolean;
  daysSinceSignup: number;
}

/**
 * Service for managing tips and hints
 * Handles tip filtering, condition checking, and user preferences
 */
export class TipService {
  /**
   * Get all available tips
   */
  public getAllTips(): TipConfig[] {
    return [...TIP_CONFIGS];
  }

  /**
   * Get tips for a specific context
   */
  public getTipsForContext(context: TipContext): TipConfig[] {
    return getTipsByContext(context);
  }

  /**
   * Get a specific tip by ID
   */
  public getTip(id: string): TipConfig | undefined {
    return getTipById(id);
  }

  /**
   * Check if a tip should be shown based on conditions and user state
   */
  public shouldShowTip(tip: TipConfig, preferences: TipPreferences, userState: UserState): boolean {
    try {
      // Check if tips are globally disabled
      if (!preferences.tipsEnabled) {
        return false;
      }

      // Check if tip is dismissed
      if (preferences.dismissedTips.includes(tip.id)) {
        return false;
      }

      // Check if tip should only show once and has already been viewed
      if (tip.showOnce && preferences.viewedTips.includes(tip.id)) {
        return false;
      }

      // Check user maturity level
      if (preferences.userMaturityScore < tip.minUserMaturity) {
        return false;
      }

      // Check tip conditions if they exist
      if (tip.conditions) {
        const conditions = tip.conditions;

        if (
          conditions.hasEnvelopes !== undefined &&
          conditions.hasEnvelopes !== userState.hasEnvelopes
        ) {
          return false;
        }

        if (
          conditions.hasTransactions !== undefined &&
          conditions.hasTransactions !== userState.hasTransactions
        ) {
          return false;
        }

        if (conditions.hasDebts !== undefined && conditions.hasDebts !== userState.hasDebts) {
          return false;
        }

        if (conditions.hasBills !== undefined && conditions.hasBills !== userState.hasBills) {
          return false;
        }

        if (
          conditions.hasPaychecks !== undefined &&
          conditions.hasPaychecks !== userState.hasPaychecks
        ) {
          return false;
        }

        if (conditions.isNewUser !== undefined) {
          const isNewUser = userState.daysSinceSignup < 7;
          if (conditions.isNewUser !== isNewUser) {
            return false;
          }
        }

        if (
          conditions.daysSinceSignup !== undefined &&
          userState.daysSinceSignup < conditions.daysSinceSignup
        ) {
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.error("Error checking if tip should show", error);
      return false;
    }
  }

  /**
   * Get applicable tips for a context considering user preferences and state
   */
  public getApplicableTips(
    context: TipContext,
    preferences: TipPreferences,
    userState: UserState
  ): TipConfig[] {
    try {
      const contextTips = this.getTipsForContext(context);

      return contextTips
        .filter((tip) => this.shouldShowTip(tip, preferences, userState))
        .sort((a, b) => {
          // Sort by priority (higher priority first)
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          const aPriority = priorityOrder[a.priority] || 0;
          const bPriority = priorityOrder[b.priority] || 0;
          return bPriority - aPriority;
        });
    } catch (error) {
      logger.error("Error getting applicable tips", error);
      return [];
    }
  }

  /**
   * Mark a tip as viewed
   */
  public markTipViewed(preferences: TipPreferences, tipId: string): TipPreferences {
    try {
      const updatedPreferences = { ...preferences };

      // Add to viewed list if not already there
      if (!updatedPreferences.viewedTips.includes(tipId)) {
        updatedPreferences.viewedTips = [...updatedPreferences.viewedTips, tipId];
      }

      // Update last viewed timestamp
      updatedPreferences.lastViewedAt = {
        ...updatedPreferences.lastViewedAt,
        [tipId]: Date.now(),
      };

      return TipPreferencesSchema.parse(updatedPreferences);
    } catch (error) {
      logger.error("Error marking tip as viewed", error);
      return preferences;
    }
  }

  /**
   * Dismiss a tip permanently
   */
  public dismissTip(preferences: TipPreferences, tipId: string): TipPreferences {
    try {
      const updatedPreferences = { ...preferences };

      // Add to dismissed list if not already there
      if (!updatedPreferences.dismissedTips.includes(tipId)) {
        updatedPreferences.dismissedTips = [...updatedPreferences.dismissedTips, tipId];
      }

      return TipPreferencesSchema.parse(updatedPreferences);
    } catch (error) {
      logger.error("Error dismissing tip", error);
      return preferences;
    }
  }

  /**
   * Undismiss a tip (from tip history)
   */
  public undismissTip(preferences: TipPreferences, tipId: string): TipPreferences {
    try {
      const updatedPreferences = { ...preferences };

      // Remove from dismissed list
      updatedPreferences.dismissedTips = updatedPreferences.dismissedTips.filter(
        (id) => id !== tipId
      );

      return TipPreferencesSchema.parse(updatedPreferences);
    } catch (error) {
      logger.error("Error undismissing tip", error);
      return preferences;
    }
  }

  /**
   * Calculate user maturity score based on actions
   * This is a simple implementation that can be enhanced later
   */
  public calculateUserMaturityScore(userState: UserState): number {
    try {
      let score = 0;

      // Basic features (0-40 points)
      if (userState.hasEnvelopes) score += 10;
      if (userState.hasTransactions) score += 10;
      if (userState.hasPaychecks) score += 10;
      if (userState.daysSinceSignup > 7) score += 10;

      // Intermediate features (40-70 points)
      if (userState.hasBills) score += 15;
      if (userState.hasDebts) score += 15;

      // Advanced usage (70-100 points)
      if (userState.daysSinceSignup > 30) score += 15;
      if (userState.daysSinceSignup > 90) score += 15;

      return Math.min(100, score);
    } catch (error) {
      logger.error("Error calculating user maturity score", error);
      return 0;
    }
  }

  /**
   * Get default preferences for new users
   */
  public getDefaultPreferences(): TipPreferences {
    return TipPreferencesSchema.parse({
      tipsEnabled: true,
      dismissedTips: [],
      viewedTips: [],
      lastViewedAt: {},
      userMaturityScore: 0,
    });
  }
}

// Export singleton instance
export const tipService = new TipService();
