import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import useUiStore from "../uiStore";

// Mock PWA patches
vi.mock("@/utils/platform/pwa/patchNotesManager", () => ({
  default: {
    getPatchNotesForVersion: vi.fn().mockResolvedValue({
      version: "2.0.0",
      notes: ["Fixed bugs"],
    }),
  },
}));

describe("UI Store", () => {
  const initialState = useUiStore.getState();

  beforeEach(() => {
    useUiStore.setState(initialState);
    useUiStore.setState({ paycheckHistory: [] }); // deeply reset array
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Basic Actions", () => {
    it("should set online status", () => {
      useUiStore.getState().setOnlineStatus(false);
      expect(useUiStore.getState().isOnline).toBe(false);
    });

    it("should set biweekly allocation", () => {
      useUiStore.getState().setBiweeklyAllocation(500);
      expect(useUiStore.getState().biweeklyAllocation).toBe(500);
    });

    it("should toggle unassigned cash modal", () => {
      useUiStore.getState().openUnassignedCashModal();
      expect(useUiStore.getState().isUnassignedCashModalOpen).toBe(true);

      useUiStore.getState().closeUnassignedCashModal();
      expect(useUiStore.getState().isUnassignedCashModalOpen).toBe(false);
    });

    it("should manage paycheck history", () => {
      const history = [{ id: "1", amount: 1000, date: "2024-01-01" }];
      useUiStore.getState().setPaycheckHistory(history);
      expect(useUiStore.getState().paycheckHistory).toEqual(history);
    });
  });

  describe("PWA Updates", () => {
    it("should set update available", () => {
      useUiStore.getState().setUpdateAvailable(true);
      expect(useUiStore.getState().updateAvailable).toBe(true);
    });

    it("should manage install prompt event", async () => {
      const mockEvent = {
        prompt: vi.fn().mockResolvedValue({ outcome: "accepted" }),
        platforms: [],
        userChoice: Promise.resolve({ outcome: "accepted" }),
      } as any;

      useUiStore.getState().setInstallPromptEvent(mockEvent);
      expect(useUiStore.getState().installPromptEvent).toBe(mockEvent);
      expect(useUiStore.getState().showInstallPrompt).toBe(false); // Default false

      useUiStore.getState().showInstallModal();
      expect(useUiStore.getState().showInstallPrompt).toBe(true);

      const result = await useUiStore.getState().installApp();
      expect(result).toBe(true);
      expect(mockEvent.prompt).toHaveBeenCalled();
      expect(useUiStore.getState().showInstallPrompt).toBe(false);
    });
  });

  describe("Patch Notes", () => {
    it("should show/hide patch notes modal", () => {
      const notes = { version: "1.0", notes: ["test"] };
      useUiStore.getState().showPatchNotesModal(notes);

      expect(useUiStore.getState().showPatchNotes).toBe(true);
      expect(useUiStore.getState().patchNotesData).toEqual(notes);

      useUiStore.getState().hidePatchNotesModal();
      expect(useUiStore.getState().showPatchNotes).toBe(false);
      expect(useUiStore.getState().patchNotesData).toBeNull();
    });

    it("should load patch notes for update", async () => {
      await useUiStore.getState().loadPatchNotesForUpdate("1.0.0", "2.0.0");

      expect(useUiStore.getState().showPatchNotes).toBe(true);
      expect(useUiStore.getState().patchNotesData?.version).toBe("2.0.0");
      expect(useUiStore.getState().patchNotesData?.isUpdate).toBe(true);
    });
  });

  describe("Reset", () => {
    it("should reset UI state", () => {
      useUiStore.getState().setBiweeklyAllocation(100);
      useUiStore.getState().resetAllData();

      expect(useUiStore.getState().biweeklyAllocation).toBe(0);
    });
  });
});
