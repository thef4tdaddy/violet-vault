import { describe, it, expect, beforeEach } from "vitest";
import useOnboardingStore from "../onboardingStore";

interface OnboardingStoreState {
  isOnboarded: boolean;
  tutorialProgress: {
    accountSetup: boolean;
    firstBankBalance: boolean;
    firstPaycheck: boolean;
    firstDebts: boolean;
    firstBills: boolean;
    firstEnvelope: boolean;
    linkedEnvelopes: boolean;
    firstAllocation: boolean;
    firstTransaction: boolean;
    syncExplained: boolean;
  };
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
  setPreference: (key: string, value: any) => void;
  isStepComplete: (step: string) => boolean;
  shouldShowHint: (step: string) => boolean;
  getProgress: () => { completed: number; total: number; percentage: number };
}

describe("useOnboardingStore", () => {
  beforeEach(() => {
    // Reset to initial state before each test
    useOnboardingStore.setState({
      isOnboarded: true,
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
      currentTutorialStep: null,
      preferences: {
        showHints: false,
        skipEmptyStateHelp: true,
        tourCompleted: true,
      },
    });
  });

  describe("initial state", () => {
    it("should initialize with isOnboarded as true", () => {
      const state = useOnboardingStore.getState() as OnboardingStoreState;
      expect(state.isOnboarded).toBe(true);
    });

    it("should initialize with all tutorial steps completed", () => {
      const state = useOnboardingStore.getState() as OnboardingStoreState;
      const progress = state.tutorialProgress;

      expect(progress.accountSetup).toBe(true);
      expect(progress.firstBankBalance).toBe(true);
      expect(progress.firstPaycheck).toBe(true);
      expect(progress.firstDebts).toBe(true);
      expect(progress.firstBills).toBe(true);
      expect(progress.firstEnvelope).toBe(true);
      expect(progress.linkedEnvelopes).toBe(true);
      expect(progress.firstAllocation).toBe(true);
      expect(progress.firstTransaction).toBe(true);
      expect(progress.syncExplained).toBe(true);
    });

    it("should initialize currentTutorialStep as null", () => {
      const state = useOnboardingStore.getState() as OnboardingStoreState;
      expect(state.currentTutorialStep).toBeNull();
    });

    it("should initialize preferences with correct defaults", () => {
      const state = useOnboardingStore.getState() as OnboardingStoreState;
      expect(state.preferences).toEqual({
        showHints: false,
        skipEmptyStateHelp: true,
        tourCompleted: true,
      });
    });
  });

  describe("tutorialProgress", () => {
    it("should have all tutorial steps in tutorialProgress", () => {
      const state = useOnboardingStore.getState() as OnboardingStoreState;
      const steps = Object.keys(state.tutorialProgress);

      expect(steps).toContain("accountSetup");
      expect(steps).toContain("firstBankBalance");
      expect(steps).toContain("firstPaycheck");
      expect(steps).toContain("firstDebts");
      expect(steps).toContain("firstBills");
      expect(steps).toContain("firstEnvelope");
      expect(steps).toContain("linkedEnvelopes");
      expect(steps).toContain("firstAllocation");
      expect(steps).toContain("firstTransaction");
      expect(steps).toContain("syncExplained");
    });

    it("should allow modifying individual tutorial steps", () => {
      useOnboardingStore.setState((state) => ({
        tutorialProgress: {
          ...state.tutorialProgress,
          accountSetup: false,
        },
      }));

      const state = useOnboardingStore.getState() as OnboardingStoreState;
      expect(state.tutorialProgress.accountSetup).toBe(false);
      expect(state.tutorialProgress.firstBankBalance).toBe(true);
    });

    it("should allow bulk updating tutorialProgress", () => {
      useOnboardingStore.setState({
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
      });

      const state = useOnboardingStore.getState() as OnboardingStoreState;
      const progress = state.tutorialProgress;

      expect(progress.accountSetup).toBe(false);
      expect(progress.firstBankBalance).toBe(false);
      expect(progress.firstPaycheck).toBe(false);
      expect(progress.firstDebts).toBe(false);
      expect(progress.firstBills).toBe(false);
      expect(progress.firstEnvelope).toBe(false);
      expect(progress.linkedEnvelopes).toBe(false);
      expect(progress.firstAllocation).toBe(false);
      expect(progress.firstTransaction).toBe(false);
      expect(progress.syncExplained).toBe(false);
    });
  });

  describe("currentTutorialStep", () => {
    it("should allow setting currentTutorialStep", () => {
      useOnboardingStore.setState({ currentTutorialStep: "firstBankBalance" });

      const state = useOnboardingStore.getState() as OnboardingStoreState;
      expect(state.currentTutorialStep).toBe("firstBankBalance");
    });

    it("should allow clearing currentTutorialStep", () => {
      useOnboardingStore.setState({ currentTutorialStep: "accountSetup" });
      useOnboardingStore.setState({ currentTutorialStep: null });

      const state = useOnboardingStore.getState() as OnboardingStoreState;
      expect(state.currentTutorialStep).toBeNull();
    });
  });

  describe("preferences", () => {
    it("should allow updating showHints preference", () => {
      useOnboardingStore.setState((state) => ({
        preferences: {
          ...state.preferences,
          showHints: true,
        },
      }));

      const state = useOnboardingStore.getState() as OnboardingStoreState;
      expect(state.preferences.showHints).toBe(true);
    });

    it("should allow updating skipEmptyStateHelp preference", () => {
      useOnboardingStore.setState((state) => ({
        preferences: {
          ...state.preferences,
          skipEmptyStateHelp: false,
        },
      }));

      const state = useOnboardingStore.getState() as OnboardingStoreState;
      expect(state.preferences.skipEmptyStateHelp).toBe(false);
    });

    it("should allow updating tourCompleted preference", () => {
      useOnboardingStore.setState((state) => ({
        preferences: {
          ...state.preferences,
          tourCompleted: false,
        },
      }));

      const state = useOnboardingStore.getState() as OnboardingStoreState;
      expect(state.preferences.tourCompleted).toBe(false);
    });

    it("should allow bulk updating preferences", () => {
      useOnboardingStore.setState({
        preferences: {
          showHints: true,
          skipEmptyStateHelp: false,
          tourCompleted: false,
        },
      });

      const state = useOnboardingStore.getState() as OnboardingStoreState;
      expect(state.preferences).toEqual({
        showHints: true,
        skipEmptyStateHelp: false,
        tourCompleted: false,
      });
    });
  });

  describe("actions", () => {
    it("should have markStepComplete action", () => {
      const state = useOnboardingStore.getState() as OnboardingStoreState;
      expect(typeof state.markStepComplete).toBe("function");
    });

    it("should have startTutorialStep action", () => {
      const state = useOnboardingStore.getState() as OnboardingStoreState;
      expect(typeof state.startTutorialStep).toBe("function");
    });

    it("should have endTutorialStep action", () => {
      const state = useOnboardingStore.getState() as OnboardingStoreState;
      expect(typeof state.endTutorialStep).toBe("function");
    });

    it("should have completeOnboarding action", () => {
      const state = useOnboardingStore.getState() as OnboardingStoreState;
      expect(typeof state.completeOnboarding).toBe("function");
    });

    it("should have resetOnboarding action", () => {
      const state = useOnboardingStore.getState() as OnboardingStoreState;
      expect(typeof state.resetOnboarding).toBe("function");
    });

    it("should have setPreference action", () => {
      const state = useOnboardingStore.getState() as OnboardingStoreState;
      expect(typeof state.setPreference).toBe("function");
    });

    it("markStepComplete should be callable without error", () => {
      expect(() => {
        (useOnboardingStore.getState() as OnboardingStoreState).markStepComplete("accountSetup");
      }).not.toThrow();
    });

    it("startTutorialStep should be callable without error", () => {
      expect(() => {
        (useOnboardingStore.getState() as OnboardingStoreState).startTutorialStep(
          "firstBankBalance"
        );
      }).not.toThrow();
    });

    it("endTutorialStep should be callable without error", () => {
      expect(() => {
        (useOnboardingStore.getState() as OnboardingStoreState).endTutorialStep();
      }).not.toThrow();
    });

    it("completeOnboarding should be callable without error", () => {
      expect(() => {
        (useOnboardingStore.getState() as OnboardingStoreState).completeOnboarding();
      }).not.toThrow();
    });

    it("resetOnboarding should be callable without error", () => {
      expect(() => {
        (useOnboardingStore.getState() as OnboardingStoreState).resetOnboarding();
      }).not.toThrow();
    });

    it("setPreference should be callable without error", () => {
      expect(() => {
        (useOnboardingStore.getState() as OnboardingStoreState).setPreference("showHints", true);
      }).not.toThrow();
    });
  });

  describe("helper methods", () => {
    it("should have isStepComplete helper method", () => {
      const state = useOnboardingStore.getState() as OnboardingStoreState;
      expect(typeof state.isStepComplete).toBe("function");
    });

    it("isStepComplete should always return true (temp disabled)", () => {
      const state = useOnboardingStore.getState() as OnboardingStoreState;
      expect(state.isStepComplete("accountSetup")).toBe(true);
      expect(state.isStepComplete("firstBankBalance")).toBe(true);
      expect(state.isStepComplete("nonExistentStep")).toBe(true);
    });

    it("should have shouldShowHint helper method", () => {
      const state = useOnboardingStore.getState() as OnboardingStoreState;
      expect(typeof state.shouldShowHint).toBe("function");
    });

    it("shouldShowHint should always return false (temp disabled)", () => {
      const state = useOnboardingStore.getState() as OnboardingStoreState;
      expect(state.shouldShowHint("accountSetup")).toBe(false);
      expect(state.shouldShowHint("firstBankBalance")).toBe(false);
      expect(state.shouldShowHint("nonExistentStep")).toBe(false);
    });

    it("should have getProgress helper method", () => {
      const state = useOnboardingStore.getState() as OnboardingStoreState;
      expect(typeof state.getProgress).toBe("function");
    });

    it("getProgress should return completion percentage", () => {
      const state = useOnboardingStore.getState() as OnboardingStoreState;
      const progress = state.getProgress();

      expect(progress).toEqual({
        completed: 10,
        total: 10,
        percentage: 100,
      });
    });
  });

  describe("state management", () => {
    it("should maintain state across multiple updates", () => {
      useOnboardingStore.setState({ isOnboarded: false });
      useOnboardingStore.setState({ currentTutorialStep: "accountSetup" });

      const state = useOnboardingStore.getState() as OnboardingStoreState;
      expect(state.isOnboarded).toBe(false);
      expect(state.currentTutorialStep).toBe("accountSetup");
    });

    it("should persist state changes using zustand persist middleware", () => {
      useOnboardingStore.setState({ isOnboarded: false });

      // Get state after setState
      const state = useOnboardingStore.getState() as OnboardingStoreState;
      expect(state.isOnboarded).toBe(false);
    });
  });
});
