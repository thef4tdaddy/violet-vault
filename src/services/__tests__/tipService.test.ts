import { describe, it, expect, beforeEach } from "vitest";
import { tipService } from "../tipService";
import { TipContext, type TipPreferences } from "@/domain/schemas/tip";

describe("TipService", () => {
  let mockUserState: {
    hasEnvelopes: boolean;
    hasTransactions: boolean;
    hasDebts: boolean;
    hasBills: boolean;
    hasPaychecks: boolean;
    daysSinceSignup: number;
  };

  let mockPreferences: TipPreferences;

  beforeEach(() => {
    mockUserState = {
      hasEnvelopes: false,
      hasTransactions: false,
      hasDebts: false,
      hasBills: false,
      hasPaychecks: false,
      daysSinceSignup: 0,
    };

    mockPreferences = tipService.getDefaultPreferences();
  });

  describe("getDefaultPreferences", () => {
    it("should return default preferences with tips enabled", () => {
      const prefs = tipService.getDefaultPreferences();

      expect(prefs.tipsEnabled).toBe(true);
      expect(prefs.dismissedTips).toEqual([]);
      expect(prefs.viewedTips).toEqual([]);
      expect(prefs.userMaturityScore).toBe(0);
    });
  });

  describe("getAllTips", () => {
    it("should return all available tips", () => {
      const tips = tipService.getAllTips();

      expect(Array.isArray(tips)).toBe(true);
      expect(tips.length).toBeGreaterThan(0);
    });
  });

  describe("getTipsForContext", () => {
    it("should return tips for dashboard context", () => {
      const tips = tipService.getTipsForContext(TipContext.DASHBOARD);

      expect(Array.isArray(tips)).toBe(true);
      tips.forEach((tip) => {
        expect(tip.context).toContain(TipContext.DASHBOARD);
      });
    });

    it("should return tips for debt context", () => {
      const tips = tipService.getTipsForContext(TipContext.DEBT);

      expect(Array.isArray(tips)).toBe(true);
      tips.forEach((tip) => {
        expect(tip.context).toContain(TipContext.DEBT);
      });
    });
  });

  describe("shouldShowTip", () => {
    it("should not show tip if tips are globally disabled", () => {
      const tip = tipService.getTip("onboarding-welcome");
      if (!tip) throw new Error("Tip not found");

      const preferences = {
        ...mockPreferences,
        tipsEnabled: false,
      };

      const result = tipService.shouldShowTip(tip, preferences, mockUserState);

      expect(result).toBe(false);
    });

    it("should not show tip if it is dismissed", () => {
      const tip = tipService.getTip("onboarding-welcome");
      if (!tip) throw new Error("Tip not found");

      const preferences = {
        ...mockPreferences,
        dismissedTips: ["onboarding-welcome"],
      };

      const result = tipService.shouldShowTip(tip, preferences, mockUserState);

      expect(result).toBe(false);
    });

    it("should not show tip if user maturity is too low", () => {
      const tip = tipService.getTip("best-practice-regular-review");
      if (!tip) throw new Error("Tip not found");

      const preferences = {
        ...mockPreferences,
        userMaturityScore: 50, // Tip requires 70
      };

      const result = tipService.shouldShowTip(tip, preferences, mockUserState);

      expect(result).toBe(false);
    });

    it("should show tip if all conditions are met", () => {
      const tip = tipService.getTip("onboarding-welcome");
      if (!tip) throw new Error("Tip not found");

      const userState = {
        ...mockUserState,
        hasEnvelopes: false, // Tip requires no envelopes
      };

      const result = tipService.shouldShowTip(tip, mockPreferences, userState);

      expect(result).toBe(true);
    });

    it("should not show tip if condition is not met", () => {
      const tip = tipService.getTip("debt-extra-payments");
      if (!tip) throw new Error("Tip not found");

      const userState = {
        ...mockUserState,
        hasDebts: false, // Tip requires debts
      };

      const result = tipService.shouldShowTip(tip, mockPreferences, userState);

      expect(result).toBe(false);
    });
  });

  describe("getApplicableTips", () => {
    it("should return applicable tips sorted by priority", () => {
      const userState = {
        ...mockUserState,
        hasEnvelopes: false,
      };

      const tips = tipService.getApplicableTips(TipContext.DASHBOARD, mockPreferences, userState);

      expect(Array.isArray(tips)).toBe(true);

      // Check that tips are sorted by priority (higher first)
      for (let i = 0; i < tips.length - 1; i++) {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const currentPriority = priorityOrder[tips[i].priority] || 0;
        const nextPriority = priorityOrder[tips[i + 1].priority] || 0;
        expect(currentPriority).toBeGreaterThanOrEqual(nextPriority);
      }
    });

    it("should return empty array if no applicable tips", () => {
      const preferences = {
        ...mockPreferences,
        tipsEnabled: false,
      };

      const tips = tipService.getApplicableTips(TipContext.DASHBOARD, preferences, mockUserState);

      expect(tips).toEqual([]);
    });
  });

  describe("markTipViewed", () => {
    it("should add tip to viewed list", () => {
      const result = tipService.markTipViewed(mockPreferences, "test-tip");

      expect(result.viewedTips).toContain("test-tip");
      expect(result.lastViewedAt["test-tip"]).toBeDefined();
    });

    it("should not duplicate tip in viewed list", () => {
      let prefs = tipService.markTipViewed(mockPreferences, "test-tip");
      prefs = tipService.markTipViewed(prefs, "test-tip");

      expect(prefs.viewedTips.filter((id) => id === "test-tip").length).toBe(1);
    });
  });

  describe("dismissTip", () => {
    it("should add tip to dismissed list", () => {
      const result = tipService.dismissTip(mockPreferences, "test-tip");

      expect(result.dismissedTips).toContain("test-tip");
    });

    it("should not duplicate tip in dismissed list", () => {
      let prefs = tipService.dismissTip(mockPreferences, "test-tip");
      prefs = tipService.dismissTip(prefs, "test-tip");

      expect(prefs.dismissedTips.filter((id) => id === "test-tip").length).toBe(1);
    });
  });

  describe("undismissTip", () => {
    it("should remove tip from dismissed list", () => {
      let prefs = tipService.dismissTip(mockPreferences, "test-tip");
      prefs = tipService.undismissTip(prefs, "test-tip");

      expect(prefs.dismissedTips).not.toContain("test-tip");
    });
  });

  describe("calculateUserMaturityScore", () => {
    it("should return 0 for brand new user", () => {
      const score = tipService.calculateUserMaturityScore(mockUserState);

      expect(score).toBe(0);
    });

    it("should increase score with basic features", () => {
      const userState = {
        ...mockUserState,
        hasEnvelopes: true,
        hasTransactions: true,
      };

      const score = tipService.calculateUserMaturityScore(userState);

      expect(score).toBeGreaterThan(0);
    });

    it("should cap score at 100", () => {
      const userState = {
        hasEnvelopes: true,
        hasTransactions: true,
        hasDebts: true,
        hasBills: true,
        hasPaychecks: true,
        daysSinceSignup: 200,
      };

      const score = tipService.calculateUserMaturityScore(userState);

      expect(score).toBeLessThanOrEqual(100);
    });
  });
});
