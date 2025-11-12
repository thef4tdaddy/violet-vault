import { describe, it, expect, beforeEach } from "vitest";
import useTipStore from "../tipStore";

describe("useTipStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useTipStore.getState().resetPreferences();
  });

  describe("initial state", () => {
    it("should have tips enabled by default", () => {
      const state = useTipStore.getState();
      expect(state.preferences.tipsEnabled).toBe(true);
    });

    it("should have empty dismissed tips", () => {
      const state = useTipStore.getState();
      expect(state.preferences.dismissedTips).toEqual([]);
    });

    it("should have empty viewed tips", () => {
      const state = useTipStore.getState();
      expect(state.preferences.viewedTips).toEqual([]);
    });

    it("should have maturity score of 0", () => {
      const state = useTipStore.getState();
      expect(state.preferences.userMaturityScore).toBe(0);
    });

    it("should have no current displayed tip", () => {
      const state = useTipStore.getState();
      expect(state.currentDisplayedTip).toBeNull();
    });
  });

  describe("setTipsEnabled", () => {
    it("should enable tips", () => {
      const { setTipsEnabled } = useTipStore.getState();
      setTipsEnabled(true);

      expect(useTipStore.getState().preferences.tipsEnabled).toBe(true);
    });

    it("should disable tips", () => {
      const { setTipsEnabled } = useTipStore.getState();
      setTipsEnabled(false);

      expect(useTipStore.getState().preferences.tipsEnabled).toBe(false);
    });
  });

  describe("markTipViewed", () => {
    it("should add tip to viewed list", () => {
      const { markTipViewed } = useTipStore.getState();
      markTipViewed("test-tip");

      const state = useTipStore.getState();
      expect(state.preferences.viewedTips).toContain("test-tip");
      expect(state.preferences.lastViewedAt["test-tip"]).toBeDefined();
    });

    it("should not duplicate viewed tips", () => {
      const { markTipViewed } = useTipStore.getState();
      markTipViewed("test-tip");
      markTipViewed("test-tip");

      const state = useTipStore.getState();
      const count = state.preferences.viewedTips.filter((id) => id === "test-tip").length;
      expect(count).toBe(1);
    });
  });

  describe("dismissTip", () => {
    it("should add tip to dismissed list", () => {
      const { dismissTip } = useTipStore.getState();
      dismissTip("test-tip");

      expect(useTipStore.getState().preferences.dismissedTips).toContain("test-tip");
    });

    it("should not duplicate dismissed tips", () => {
      const { dismissTip } = useTipStore.getState();
      dismissTip("test-tip");
      dismissTip("test-tip");

      const state = useTipStore.getState();
      const count = state.preferences.dismissedTips.filter((id) => id === "test-tip").length;
      expect(count).toBe(1);
    });
  });

  describe("undismissTip", () => {
    it("should remove tip from dismissed list", () => {
      const { dismissTip, undismissTip } = useTipStore.getState();
      dismissTip("test-tip");
      undismissTip("test-tip");

      expect(useTipStore.getState().preferences.dismissedTips).not.toContain("test-tip");
    });

    it("should handle undismissing non-dismissed tip", () => {
      const { undismissTip } = useTipStore.getState();
      undismissTip("non-existent-tip");

      expect(useTipStore.getState().preferences.dismissedTips).toEqual([]);
    });
  });

  describe("updateUserMaturityScore", () => {
    it("should update maturity score", () => {
      const { updateUserMaturityScore } = useTipStore.getState();
      updateUserMaturityScore(50);

      expect(useTipStore.getState().preferences.userMaturityScore).toBe(50);
    });

    it("should cap score at 100", () => {
      const { updateUserMaturityScore } = useTipStore.getState();
      updateUserMaturityScore(150);

      expect(useTipStore.getState().preferences.userMaturityScore).toBe(100);
    });

    it("should floor score at 0", () => {
      const { updateUserMaturityScore } = useTipStore.getState();
      updateUserMaturityScore(-10);

      expect(useTipStore.getState().preferences.userMaturityScore).toBe(0);
    });
  });

  describe("setCurrentDisplayedTip", () => {
    it("should set current displayed tip", () => {
      const { setCurrentDisplayedTip } = useTipStore.getState();
      setCurrentDisplayedTip("test-tip");

      expect(useTipStore.getState().currentDisplayedTip).toBe("test-tip");
    });

    it("should clear current displayed tip", () => {
      const { setCurrentDisplayedTip } = useTipStore.getState();
      setCurrentDisplayedTip("test-tip");
      setCurrentDisplayedTip(null);

      expect(useTipStore.getState().currentDisplayedTip).toBeNull();
    });
  });

  describe("resetPreferences", () => {
    it("should reset all preferences to defaults", () => {
      const { markTipViewed, dismissTip, updateUserMaturityScore, resetPreferences } =
        useTipStore.getState();

      // Make some changes
      markTipViewed("tip1");
      dismissTip("tip2");
      updateUserMaturityScore(75);

      // Reset
      resetPreferences();

      const state = useTipStore.getState();
      expect(state.preferences.tipsEnabled).toBe(true);
      expect(state.preferences.viewedTips).toEqual([]);
      expect(state.preferences.dismissedTips).toEqual([]);
      expect(state.preferences.userMaturityScore).toBe(0);
    });
  });

  describe("helper methods", () => {
    it("isTipDismissed should return true for dismissed tips", () => {
      const { dismissTip, isTipDismissed } = useTipStore.getState();
      dismissTip("test-tip");

      expect(isTipDismissed("test-tip")).toBe(true);
      expect(isTipDismissed("other-tip")).toBe(false);
    });

    it("isTipViewed should return true for viewed tips", () => {
      const { markTipViewed, isTipViewed } = useTipStore.getState();
      markTipViewed("test-tip");

      expect(isTipViewed("test-tip")).toBe(true);
      expect(isTipViewed("other-tip")).toBe(false);
    });
  });
});
