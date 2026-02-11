import { describe, it, expect, beforeEach, vi } from "vitest";
import { useFABStore } from "../fabStore";
import { enableMapSet } from "immer";

enableMapSet();

describe("FAB Store", () => {
  const initialState = useFABStore.getState();

  beforeEach(() => {
    useFABStore.setState(initialState);
  });

  describe("Visibility & Expansion", () => {
    it("should toggle visibility", () => {
      useFABStore.getState().setVisibility(false);
      expect(useFABStore.getState().isVisible).toBe(false);

      useFABStore.getState().setVisibility(true);
      expect(useFABStore.getState().isVisible).toBe(true);
    });

    it("should collapse when hidden", () => {
      useFABStore.getState().setExpanded(true);
      expect(useFABStore.getState().isExpanded).toBe(true);

      useFABStore.getState().setVisibility(false);
      expect(useFABStore.getState().isVisible).toBe(false);
      expect(useFABStore.getState().isExpanded).toBe(false);
    });

    it("should toggle expansion", () => {
      useFABStore.getState().toggleExpanded();
      expect(useFABStore.getState().isExpanded).toBe(true);

      useFABStore.getState().toggleExpanded();
      expect(useFABStore.getState().isExpanded).toBe(false);
    });
  });

  describe("Screen Management", () => {
    it("should set current screen", () => {
      useFABStore.getState().setCurrentScreen("profile");
      expect(useFABStore.getState().currentScreen).toBe("profile");
      // Changing screen should collapse FAB
      expect(useFABStore.getState().isExpanded).toBe(false);
    });
  });

  describe("Action Registration", () => {
    const mockAction = {
      id: "test",
      icon: "Test",
      label: "Test Action",
      color: "blue",
      action: vi.fn(),
    };

    it("should register and unregister primary action", () => {
      useFABStore.getState().registerPrimaryAction("test-screen", mockAction);
      expect(useFABStore.getState().primaryActions.get("test-screen")).toEqual(mockAction);

      useFABStore.getState().unregisterPrimaryAction("test-screen");
      expect(useFABStore.getState().primaryActions.has("test-screen")).toBe(false);
    });

    it("should register and unregister secondary action", () => {
      useFABStore.getState().registerSecondaryAction(mockAction);
      expect(useFABStore.getState().secondaryActions.get("test")).toEqual(mockAction);

      useFABStore.getState().unregisterSecondaryAction("test");
      expect(useFABStore.getState().secondaryActions.has("test")).toBe(false);
    });

    it("should clear screen actions", () => {
      useFABStore.getState().registerPrimaryAction("test-screen", mockAction);
      useFABStore.getState().clearScreenActions("test-screen");
      expect(useFABStore.getState().primaryActions.has("test-screen")).toBe(false);
    });
  });

  describe("Default Actions", () => {
    it("should set default action handler", () => {
      const handler = vi.fn();
      useFABStore.getState().setDefaultActionHandler("bug-report", handler);

      const debugInfo = useFABStore.getState().getDebugInfo();
      expect(debugInfo.defaultActionsWithHandlers).toBeGreaterThan(0);

      const action = useFABStore.getState().defaultSecondaryActions["bug-report"];
      expect(action.action).toBe(handler);
    });
  });
});
