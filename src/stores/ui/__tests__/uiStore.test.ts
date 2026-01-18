import { describe, it, expect, beforeEach } from "vitest";
import useUiStore from "../uiStore";

describe("useUiStore", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useUiStore.setState({
      biweeklyAllocation: 0,
      isUnassignedCashModalOpen: false,
      paycheckHistory: [],
      isActualBalanceManual: false,
      isOnline: true,
      dataLoaded: false,
      cloudSyncEnabled: true,
      updateAvailable: false,
      isUpdating: false,
      showInstallPrompt: false,
      installPromptEvent: null,
      showPatchNotes: false,
      patchNotesData: null,
      loadingPatchNotes: false,
    });
  });

  describe("initial state", () => {
    it("should initialize with correct default values", () => {
      const state = useUiStore.getState();

      expect(state.biweeklyAllocation).toBe(0);
      expect(state.isUnassignedCashModalOpen).toBe(false);
      expect(state.isActualBalanceManual).toBe(false);
      expect(state.isOnline).toBe(true);
      expect(state.dataLoaded).toBe(false);
      expect(state.cloudSyncEnabled).toBe(true);
    });

    it("should initialize PWA state correctly", () => {
      const state = useUiStore.getState();

      expect(state.updateAvailable).toBe(false);
      expect(state.isUpdating).toBe(false);
      expect(state.showInstallPrompt).toBe(false);
      expect(state.installPromptEvent).toBeNull();
    });

    it("should initialize patch notes state correctly", () => {
      const state = useUiStore.getState();

      expect(state.showPatchNotes).toBe(false);
      expect(state.patchNotesData).toBeNull();
      expect(state.loadingPatchNotes).toBe(false);
    });

    it("should initialize paycheck history as empty array", () => {
      const state = useUiStore.getState();
      expect(Array.isArray(state.paycheckHistory)).toBe(true);
      expect(state.paycheckHistory.length).toBe(0);
    });
  });

  describe("basic state properties", () => {
    it("should have biweeklyAllocation property", () => {
      const state = useUiStore.getState();
      expect("biweeklyAllocation" in state).toBe(true);
      expect(typeof state.biweeklyAllocation).toBe("number");
    });

    it("should have isUnassignedCashModalOpen property", () => {
      const state = useUiStore.getState();
      expect("isUnassignedCashModalOpen" in state).toBe(true);
      expect(typeof state.isUnassignedCashModalOpen).toBe("boolean");
    });

    it("should have isOnline property", () => {
      const state = useUiStore.getState();
      expect("isOnline" in state).toBe(true);
      expect(typeof state.isOnline).toBe("boolean");
    });

    it("should have cloudSyncEnabled property", () => {
      const state = useUiStore.getState();
      expect("cloudSyncEnabled" in state).toBe(true);
      expect(typeof state.cloudSyncEnabled).toBe("boolean");
    });

    it("should have dataLoaded property", () => {
      const state = useUiStore.getState();
      expect("dataLoaded" in state).toBe(true);
      expect(typeof state.dataLoaded).toBe("boolean");
    });

    it("should have updateAvailable property", () => {
      const state = useUiStore.getState();
      expect("updateAvailable" in state).toBe(true);
      expect(typeof state.updateAvailable).toBe("boolean");
    });

    it("should have isUpdating property", () => {
      const state = useUiStore.getState();
      expect("isUpdating" in state).toBe(true);
      expect(typeof state.isUpdating).toBe("boolean");
    });

    it("should have showInstallPrompt property", () => {
      const state = useUiStore.getState();
      expect("showInstallPrompt" in state).toBe(true);
      expect(typeof state.showInstallPrompt).toBe("boolean");
    });

    it("should have showPatchNotes property", () => {
      const state = useUiStore.getState();
      expect("showPatchNotes" in state).toBe(true);
      expect(typeof state.showPatchNotes).toBe("boolean");
    });

    it("should have loadingPatchNotes property", () => {
      const state = useUiStore.getState();
      expect("loadingPatchNotes" in state).toBe(true);
      expect(typeof state.loadingPatchNotes).toBe("boolean");
    });
  });

  describe("basic action methods from createBasicActions", () => {
    it("should have setBiweeklyAllocation method", () => {
      const state = useUiStore.getState();
      expect(typeof state.setBiweeklyAllocation).toBe("function");
    });

    it("should have openUnassignedCashModal method", () => {
      const state = useUiStore.getState();
      expect(typeof state.openUnassignedCashModal).toBe("function");
    });

    it("should have closeUnassignedCashModal method", () => {
      const state = useUiStore.getState();
      expect(typeof state.closeUnassignedCashModal).toBe("function");
    });

    it("should have setPaycheckHistory method", () => {
      const state = useUiStore.getState();
      expect(typeof state.setPaycheckHistory).toBe("function");
    });

    it("should have setDataLoaded method", () => {
      const state = useUiStore.getState();
      expect(typeof state.setDataLoaded).toBe("function");
    });

    it("should have setOnlineStatus method", () => {
      const state = useUiStore.getState();
      expect(typeof state.setOnlineStatus).toBe("function");
    });

    it("should have setCloudSyncEnabled method", () => {
      const state = useUiStore.getState();
      expect(typeof state.setCloudSyncEnabled).toBe("function");
    });
  });

  describe("PWA update actions", () => {
    it("should have setUpdateAvailable method", () => {
      const state = useUiStore.getState();
      expect(typeof state.setUpdateAvailable).toBe("function");
    });

    it("should have setIsUpdating method", () => {
      const state = useUiStore.getState();
      expect(typeof state.setIsUpdating).toBe("function");
    });

    it("should have showInstallModal method", () => {
      const state = useUiStore.getState();
      expect(typeof state.showInstallModal).toBe("function");
    });

    it("should have hideInstallModal method", () => {
      const state = useUiStore.getState();
      expect(typeof state.hideInstallModal).toBe("function");
    });

    it("should have setInstallPromptEvent method", () => {
      const state = useUiStore.getState();
      expect(typeof state.setInstallPromptEvent).toBe("function");
    });

    it("should have updateApp method", () => {
      const state = useUiStore.getState();
      expect(typeof state.updateApp).toBe("function");
    });

    it("should have installApp method", () => {
      const state = useUiStore.getState();
      expect(typeof state.installApp).toBe("function");
    });

    it("should have manualInstall method", () => {
      const state = useUiStore.getState();
      expect(typeof state.manualInstall).toBe("function");
    });

    it("should have dismissInstallPrompt method", () => {
      const state = useUiStore.getState();
      expect(typeof state.dismissInstallPrompt).toBe("function");
    });
  });

  describe("patch notes actions", () => {
    it("should have showPatchNotesModal method", () => {
      const state = useUiStore.getState();
      expect(typeof state.showPatchNotesModal).toBe("function");
    });

    it("should have hidePatchNotesModal method", () => {
      const state = useUiStore.getState();
      expect(typeof state.hidePatchNotesModal).toBe("function");
    });
  });

  describe("special action methods", () => {
    it("should have resetAllData method", () => {
      const state = useUiStore.getState();
      expect(typeof state.resetAllData).toBe("function");
    });

    it("should have setDebts method (legacy)", () => {
      const state = useUiStore.getState();
      expect(typeof state.setDebts).toBe("function");
    });

    it("should have startBackgroundSync method", () => {
      const state = useUiStore.getState();
      expect(typeof state.startBackgroundSync).toBe("function");
    });

    it("should have loadPatchNotesForUpdate method", () => {
      const state = useUiStore.getState();
      expect(typeof state.loadPatchNotesForUpdate).toBe("function");
    });
  });

  describe("store structure", () => {
    it("store should be accessible via useUiStore", () => {
      const store = useUiStore;
      expect(typeof store.getState).toBe("function");
    });

    it("store.getState should return current state object", () => {
      const state = useUiStore.getState();
      expect(state).not.toBeNull();
      expect(typeof state).toBe("object");
    });

    it("store should support subscription", () => {
      const store = useUiStore;
      expect(typeof store.subscribe).toBe("function");
    });
  });

  describe("state updates without errors", () => {
    it("resetAllData should not throw", () => {
      const state = useUiStore.getState();
      expect(() => {
        state.resetAllData();
      }).not.toThrow();
    });

    it("setDataLoaded should not throw", () => {
      const state = useUiStore.getState();
      expect(() => {
        state.setDataLoaded(true);
      }).not.toThrow();
    });

    it("setOnlineStatus should not throw", () => {
      const state = useUiStore.getState();
      expect(() => {
        state.setOnlineStatus(false);
      }).not.toThrow();
    });

    it("setBiweeklyAllocation should not throw", () => {
      const state = useUiStore.getState();
      expect(() => {
        state.setBiweeklyAllocation(100);
      }).not.toThrow();
    });

    it("setCloudSyncEnabled should not throw", () => {
      const state = useUiStore.getState();
      expect(() => {
        state.setCloudSyncEnabled(false);
      }).not.toThrow();
    });

    it("setUpdateAvailable should not throw", () => {
      const state = useUiStore.getState();
      expect(() => {
        state.setUpdateAvailable(true);
      }).not.toThrow();
    });

    it("openUnassignedCashModal should not throw", () => {
      const state = useUiStore.getState();
      expect(() => {
        state.openUnassignedCashModal();
      }).not.toThrow();
    });

    it("closeUnassignedCashModal should not throw", () => {
      const state = useUiStore.getState();
      expect(() => {
        state.closeUnassignedCashModal();
      }).not.toThrow();
    });

    it("setPaycheckHistory should not throw", () => {
      const state = useUiStore.getState();
      expect(() => {
        state.setPaycheckHistory([]);
      }).not.toThrow();
    });

    it("showInstallModal should not throw", () => {
      const state = useUiStore.getState();
      expect(() => {
        state.showInstallModal();
      }).not.toThrow();
    });

    it("hideInstallModal should not throw", () => {
      const state = useUiStore.getState();
      expect(() => {
        state.hideInstallModal();
      }).not.toThrow();
    });

    it("showPatchNotesModal should not throw", () => {
      const state = useUiStore.getState();
      expect(() => {
        state.showPatchNotesModal({ version: "1.0.0" });
      }).not.toThrow();
    });

    it("hidePatchNotesModal should not throw", () => {
      const state = useUiStore.getState();
      expect(() => {
        state.hidePatchNotesModal();
      }).not.toThrow();
    });

    it("setDebts should not throw", () => {
      const state = useUiStore.getState();
      expect(() => {
        state.setDebts();
      }).not.toThrow();
    });
  });

  describe("state mutations", () => {
    it("setBiweeklyAllocation should update biweeklyAllocation", () => {
      const state = useUiStore.getState();
      state.setBiweeklyAllocation(500);
      const updatedState = useUiStore.getState();
      expect(updatedState.biweeklyAllocation).toBe(500);
    });

    it("setDataLoaded should update dataLoaded", () => {
      const state = useUiStore.getState();
      state.setDataLoaded(true);
      const updatedState = useUiStore.getState();
      expect(updatedState.dataLoaded).toBe(true);
    });

    it("setOnlineStatus should update isOnline", () => {
      const state = useUiStore.getState();
      state.setOnlineStatus(false);
      const updatedState = useUiStore.getState();
      expect(updatedState.isOnline).toBe(false);
    });

    it("setCloudSyncEnabled should update cloudSyncEnabled", () => {
      const state = useUiStore.getState();
      state.setCloudSyncEnabled(false);
      const updatedState = useUiStore.getState();
      expect(updatedState.cloudSyncEnabled).toBe(false);
    });

    it("openUnassignedCashModal should open modal", () => {
      const state = useUiStore.getState();
      state.openUnassignedCashModal();
      const updatedState = useUiStore.getState();
      expect(updatedState.isUnassignedCashModalOpen).toBe(true);
    });

    it("closeUnassignedCashModal should close modal", () => {
      const state = useUiStore.getState();
      state.openUnassignedCashModal();
      state.closeUnassignedCashModal();
      const updatedState = useUiStore.getState();
      expect(updatedState.isUnassignedCashModalOpen).toBe(false);
    });

    it("setPaycheckHistory should update paycheckHistory", () => {
      const state = useUiStore.getState();
      const history = [{ date: "2024-01-01", amount: 1000 }];
      state.setPaycheckHistory(history);
      const updatedState = useUiStore.getState();
      expect(updatedState.paycheckHistory).toEqual(history);
    });

    it("setUpdateAvailable should update updateAvailable", () => {
      const state = useUiStore.getState();
      state.setUpdateAvailable(true);
      const updatedState = useUiStore.getState();
      expect(updatedState.updateAvailable).toBe(true);
    });

    it("setIsUpdating should update isUpdating", () => {
      const state = useUiStore.getState();
      state.setIsUpdating(true);
      const updatedState = useUiStore.getState();
      expect(updatedState.isUpdating).toBe(true);
    });

    it("showInstallModal should show install prompt", () => {
      const state = useUiStore.getState();
      state.showInstallModal();
      const updatedState = useUiStore.getState();
      expect(updatedState.showInstallPrompt).toBe(true);
    });

    it("hideInstallModal should hide install prompt", () => {
      const state = useUiStore.getState();
      state.showInstallModal();
      state.hideInstallModal();
      const updatedState = useUiStore.getState();
      expect(updatedState.showInstallPrompt).toBe(false);
    });

    it("showPatchNotesModal should show patch notes", () => {
      const state = useUiStore.getState();
      const patchData = { version: "1.0.0", changes: ["Fix 1"] };
      state.showPatchNotesModal(patchData);
      const updatedState = useUiStore.getState();
      expect(updatedState.showPatchNotes).toBe(true);
      expect(updatedState.patchNotesData).toEqual(patchData);
    });

    it("hidePatchNotesModal should hide patch notes", () => {
      const state = useUiStore.getState();
      state.showPatchNotesModal({ version: "1.0.0" });
      state.hidePatchNotesModal();
      const updatedState = useUiStore.getState();
      expect(updatedState.showPatchNotes).toBe(false);
      expect(updatedState.patchNotesData).toBeNull();
    });

    it("resetAllData should reset UI state", () => {
      const state = useUiStore.getState();
      state.setBiweeklyAllocation(500);
      state.setDataLoaded(true);
      state.openUnassignedCashModal();
      state.resetAllData();
      const resetState = useUiStore.getState();
      expect(resetState.biweeklyAllocation).toBe(0);
      expect(resetState.dataLoaded).toBe(false);
      expect(resetState.isUnassignedCashModalOpen).toBe(false);
    });
  });

  describe("async methods", () => {
    it("loadPatchNotesForUpdate should be callable", () => {
      const state = useUiStore.getState();
      expect(typeof state.loadPatchNotesForUpdate).toBe("function");
    });

    it("startBackgroundSync should be callable", () => {
      const state = useUiStore.getState();
      expect(typeof state.startBackgroundSync).toBe("function");
    });
  });

  describe("v2.0 migration removal", () => {
    it("should not have runMigrationIfNeeded method", () => {
      const state = useUiStore.getState();
      expect(state.runMigrationIfNeeded).toBeUndefined();
    });

    it("should not have legacy migration methods in store", () => {
      const state = useUiStore.getState();
      // Verify migration-related methods are removed
      expect(state).not.toHaveProperty("runMigrationIfNeeded");
    });
  });
});
