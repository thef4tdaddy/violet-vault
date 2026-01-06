import { clearFirebaseData, forcePushToCloud } from "../firebaseUtils";
import { syncOrchestrator } from "../../../services/sync/syncOrchestrator";
import { vi } from "vitest";

vi.mock("../../../services/sync/syncOrchestrator", () => ({
  syncOrchestrator: {
    stop: vi.fn(),
    forceSync: vi.fn(),
  },
}));

describe("firebaseUtils", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("clearFirebaseData", () => {
    it("should call forceSync", async () => {
      await clearFirebaseData();
      expect(syncOrchestrator.forceSync).toHaveBeenCalled();
    });
  });

  describe("forcePushToCloud", () => {
    it("should stop orchestrator, force sync, and return success", async () => {
      (syncOrchestrator.forceSync as never as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
      });
      const result = await forcePushToCloud();
      expect(syncOrchestrator.stop).toHaveBeenCalled();
      expect(syncOrchestrator.forceSync).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it("should throw an error if force sync fails", async () => {
      (syncOrchestrator.forceSync as never as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: "Test Error",
      });
      await expect(forcePushToCloud()).rejects.toThrow("Test Error");
    });
  });
});
