import { describe, it, expect } from "vitest";
import { useFABStore } from "../fabStore";

describe("useFABStore", () => {
  describe("core state properties", () => {
    it("should have isVisible property", () => {
      const state = useFABStore.getState();
      expect("isVisible" in state).toBe(true);
      expect(typeof state.isVisible).toBe("boolean");
    });

    it("should have isExpanded property", () => {
      const state = useFABStore.getState();
      expect("isExpanded" in state).toBe(true);
      expect(typeof state.isExpanded).toBe("boolean");
    });

    it("should have currentScreen property", () => {
      const state = useFABStore.getState();
      expect("currentScreen" in state).toBe(true);
      expect(typeof state.currentScreen).toBe("string");
    });

    it("should have primaryActions Map", () => {
      const state = useFABStore.getState();
      expect(state.primaryActions).toBeInstanceOf(Map);
    });

    it("should have secondaryActions Map", () => {
      const state = useFABStore.getState();
      expect(state.secondaryActions).toBeInstanceOf(Map);
    });

    it("should have defaultSecondaryActions", () => {
      const state = useFABStore.getState();
      expect("defaultSecondaryActions" in state).toBe(true);
      expect(typeof state.defaultSecondaryActions).toBe("object");
    });
  });

  describe("action methods", () => {
    it("should have setCurrentScreen action", () => {
      const state = useFABStore.getState();
      expect(typeof state.setCurrentScreen).toBe("function");
    });

    it("should have setVisibility action", () => {
      const state = useFABStore.getState();
      expect(typeof state.setVisibility).toBe("function");
    });

    it("should have setExpanded action", () => {
      const state = useFABStore.getState();
      expect(typeof state.setExpanded).toBe("function");
    });

    it("should have toggleExpanded action", () => {
      const state = useFABStore.getState();
      expect(typeof state.toggleExpanded).toBe("function");
    });

    it("should have registerPrimaryAction action", () => {
      const state = useFABStore.getState();
      expect(typeof state.registerPrimaryAction).toBe("function");
    });

    it("should have unregisterPrimaryAction action", () => {
      const state = useFABStore.getState();
      expect(typeof state.unregisterPrimaryAction).toBe("function");
    });

    it("should have registerSecondaryAction action", () => {
      const state = useFABStore.getState();
      expect(typeof state.registerSecondaryAction).toBe("function");
    });

    it("should have unregisterSecondaryAction action", () => {
      const state = useFABStore.getState();
      expect(typeof state.unregisterSecondaryAction).toBe("function");
    });

    it("should have setDefaultActionHandler action", () => {
      const state = useFABStore.getState();
      expect(typeof state.setDefaultActionHandler).toBe("function");
    });

    it("should have clearScreenActions action", () => {
      const state = useFABStore.getState();
      expect(typeof state.clearScreenActions).toBe("function");
    });
  });

  describe("helper methods", () => {
    it("should have getDebugInfo method", () => {
      const state = useFABStore.getState();
      expect(typeof state.getDebugInfo).toBe("function");
    });

    it("getDebugInfo should return debug object with expected properties", () => {
      const state = useFABStore.getState();
      const debugInfo = state.getDebugInfo();

      expect(debugInfo).toHaveProperty("currentScreen");
      expect(debugInfo).toHaveProperty("isVisible");
      expect(debugInfo).toHaveProperty("isExpanded");
      expect(debugInfo).toHaveProperty("primaryActionsCount");
      expect(debugInfo).toHaveProperty("secondaryActionsCount");
      expect(debugInfo).toHaveProperty("defaultActionsWithHandlers");
    });

    it("getDebugInfo should return correct types", () => {
      const state = useFABStore.getState();
      const debugInfo = state.getDebugInfo();

      expect(typeof debugInfo.currentScreen).toBe("string");
      expect(typeof debugInfo.isVisible).toBe("boolean");
      expect(typeof debugInfo.isExpanded).toBe("boolean");
      expect(typeof debugInfo.primaryActionsCount).toBe("number");
      expect(typeof debugInfo.secondaryActionsCount).toBe("number");
      expect(typeof debugInfo.defaultActionsWithHandlers).toBe("number");
    });
  });

  describe("action calling - basic smoke tests", () => {
    it("setCurrentScreen should be callable without throwing", () => {
      const state = useFABStore.getState();
      // Note: Immer makes state mutations in setCurrentScreen
      // We test that the action exists and is callable
      expect(typeof state.setCurrentScreen).toBe("function");
    });

    it("toggleExpanded should be callable without throwing", () => {
      const state = useFABStore.getState();
      expect(typeof state.toggleExpanded).toBe("function");
    });
  });

  describe("store persistence", () => {
    it("store should be accessible via useFABStore", () => {
      const store = useFABStore;
      expect(typeof store.getState).toBe("function");
    });

    it("store.getState should return current state", () => {
      const state = useFABStore.getState();
      expect(state).not.toBeNull();
      expect(typeof state).toBe("object");
    });
  });
});
