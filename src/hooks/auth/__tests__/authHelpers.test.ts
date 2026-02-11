import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  startBackgroundSyncAfterLogin,
  deriveLoginEncryptionKey,
  handleNewUserSetup,
  processJoinBudget,
} from "../authHelpers";
import { encryptionUtils } from "@/utils/platform/security/encryption";
import localStorageService from "@/services/storage/localStorageService";
import { identifyUser } from "@/utils/core/common/sentry";

// Mock dependencies
vi.mock("@/utils/platform/security/encryption", () => ({
  encryptionUtils: {
    deriveKeyFromSalt: vi.fn(),
    generateBudgetId: vi.fn(),
    encrypt: vi.fn(),
  },
}));

vi.mock("@/services/storage/localStorageService", () => ({
  default: {
    setBudgetData: vi.fn(),
    setUserProfile: vi.fn(),
  },
  localStorageService: {
    setBudgetData: vi.fn(),
    setUserProfile: vi.fn(),
  },
}));

vi.mock("@/utils/core/common/sentry", () => ({
  identifyUser: vi.fn(),
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    auth: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock dynamic imports
vi.mock("@/services/sync/syncOrchestrator", () => ({
  syncOrchestrator: {
    start: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/services/sync/providers/firebaseSyncProvider", () => ({
  FirebaseSyncProvider: vi.fn(),
}));

vi.mock("@/utils/core/testing/factories/fixtures", () => ({
  fullBudgetState: {
    envelopes: [],
    bills: [],
    transactions: [],
    unassignedCash: 0,
  },
}));

describe("authHelpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("startBackgroundSyncAfterLogin", () => {
    it("should start sync orchestrator after delay", async () => {
      vi.useFakeTimers();
      const mockKey = { type: "secret" } as unknown as CryptoKey;
      const startPromise = startBackgroundSyncAfterLogin("budget-123", mockKey, false);

      // Fast-forward time
      await vi.advanceTimersByTimeAsync(2500);

      await startPromise;

      const { syncOrchestrator } = await import("@/services/sync/syncOrchestrator");
      expect(syncOrchestrator.start).toHaveBeenCalledWith(
        expect.objectContaining({
          budgetId: "budget-123",
          encryptionKey: mockKey,
        })
      );
      vi.useRealTimers();
    });

    it("should handle sync start errors", async () => {
      vi.useFakeTimers();
      const { syncOrchestrator } = await import("@/services/sync/syncOrchestrator");
      (syncOrchestrator.start as any).mockRejectedValueOnce(new Error("Sync fail"));

      const startPromise = startBackgroundSyncAfterLogin("budget-123", {} as CryptoKey, false);
      await vi.advanceTimersByTimeAsync(2500);
      await startPromise;

      // Success means it didn't throw (errors are logged)
      vi.useRealTimers();
    });
  });

  describe("deriveLoginEncryptionKey", () => {
    it("should derive key using saved salt when no shareCode is provided", async () => {
      const password = "password";
      const savedSalt = [1, 2, 3];
      const mockKey = { type: "secret" } as unknown as CryptoKey;
      (encryptionUtils.deriveKeyFromSalt as any).mockResolvedValue(mockKey);

      const result = await deriveLoginEncryptionKey(password, savedSalt);

      expect(encryptionUtils.deriveKeyFromSalt).toHaveBeenCalledWith(
        password,
        expect.any(Uint8Array)
      );
      expect(result.key).toBe(mockKey);
      expect(result.salt).toEqual(new Uint8Array(savedSalt));
    });

    it("should derive deterministic key when shareCode is provided", async () => {
      const password = "password";
      const shareCode = "word1 word2 word3 word4";
      const mockKey = { type: "secret" } as unknown as CryptoKey;
      (encryptionUtils.deriveKeyFromSalt as any).mockResolvedValue(mockKey);

      // Web Crypto digest mock
      const mockDigest = new Uint8Array(32).fill(1).buffer;
      const cryptoSpy = vi.spyOn(crypto.subtle, "digest").mockResolvedValue(mockDigest);

      const result = await deriveLoginEncryptionKey(password, [0], shareCode);

      expect(cryptoSpy).toHaveBeenCalled();
      expect(encryptionUtils.deriveKeyFromSalt).toHaveBeenCalledWith(
        password,
        new Uint8Array(mockDigest)
      );
      expect(result.key).toBe(mockKey);
    });
  });

  describe("handleNewUserSetup", () => {
    it("should initialize budget data and user profile", async () => {
      const userData = { userName: "Test User", shareCode: "code" } as any;
      const password = "password";
      const mockKey = {} as CryptoKey;
      const mockSalt = new Uint8Array([1]);

      (encryptionUtils.deriveKeyFromSalt as any).mockResolvedValue(mockKey);
      (encryptionUtils.generateBudgetId as any).mockResolvedValue("budget-123");
      (encryptionUtils.encrypt as any).mockResolvedValue({ data: [1], iv: [1] });

      const result = await handleNewUserSetup(userData, password);

      expect(localStorageService.setBudgetData).toHaveBeenCalled();
      expect(localStorageService.setUserProfile).toHaveBeenCalled();
      expect(identifyUser).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.isNewUser).toBe(true);
    });

    it("should throw if share code is missing", async () => {
      const userData = { userName: "Test User" } as any;
      await expect(handleNewUserSetup(userData, "pass")).rejects.toThrow("Share code missing");
    });
  });

  describe("processJoinBudget", () => {
    it("should complete shared budget joining", async () => {
      const joinData = {
        budgetId: "budget-123",
        password: "password",
        userInfo: { userName: "Joiner" },
        sharedBy: "Owner",
        shareCode: "code",
      } as any;

      (encryptionUtils.deriveKeyFromSalt as any).mockResolvedValue({} as CryptoKey);
      (encryptionUtils.encrypt as any).mockResolvedValue({ data: [1], iv: [1] });

      const result = await processJoinBudget(joinData);

      expect(localStorageService.setBudgetData).toHaveBeenCalled();
      expect(localStorageService.setUserProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          userName: "Joiner",
          sharedBy: "Owner",
        })
      );
      expect(result.success).toBe(true);
    });
  });
});
