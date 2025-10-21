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
  },
}));

describe("firebaseUtils", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("clearFirebaseData", () => {
    it("should call clearAllData and clear syncMetadata", async () => {
      await clearFirebaseData();
      expect(cloudSyncService.clearAllData).toHaveBeenCalled();
      expect(budgetDb.syncMetadata.clear).toHaveBeenCalled();
    });
  });

  describe("forcePushToCloud", () => {
    it("should stop service, force push, and return success", async () => {
      cloudSyncService.forcePushToCloud.mockResolvedValue({ success: true });
      const result = await forcePushToCloud();
      expect(cloudSyncService.stop).toHaveBeenCalled();
      expect(cloudSyncService.forcePushToCloud).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it("should throw an error if force push fails", async () => {
      cloudSyncService.forcePushToCloud.mockResolvedValue({
        success: false,
        error: "Test Error",
      });
      await expect(forcePushToCloud()).rejects.toThrow("Test Error");
    });
  });
});
