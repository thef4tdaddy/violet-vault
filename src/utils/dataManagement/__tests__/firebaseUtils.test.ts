import { clearFirebaseData, forcePushToCloud } from "../firebaseUtils";
import { cloudSyncService } from "../../../services/cloudSyncService";
import { budgetDb } from "../../../db/budgetDb";
import { vi } from "vitest";

vi.mock("../../../services/cloudSyncService", () => ({
  cloudSyncService: {
    clearAllData: vi.fn(),
    stop: vi.fn(),
    forcePushToCloud: vi.fn(),
  },
}));

vi.mock("../../../db/budgetDb", () => ({
  budgetDb: {
    syncMetadata: {
      clear: vi.fn(),
    },
  } as never,
}));

describe("firebaseUtils", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("clearFirebaseData", () => {
    it("should call clearAllData", async () => {
      await clearFirebaseData();
      expect(cloudSyncService.clearAllData).toHaveBeenCalled();
    });
  });

  describe("forcePushToCloud", () => {
    it("should stop service, force push, and return success", async () => {
      (cloudSyncService.forcePushToCloud as never as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
      const result = await forcePushToCloud();
      expect(cloudSyncService.stop).toHaveBeenCalled();
      expect(cloudSyncService.forcePushToCloud).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it("should throw an error if force push fails", async () => {
      (cloudSyncService.forcePushToCloud as never as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: "Test Error",
      });
      await expect(forcePushToCloud()).rejects.toThrow("Test Error");
    });
  });
});
