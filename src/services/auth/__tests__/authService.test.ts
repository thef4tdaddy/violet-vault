import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  validatePassword,
  login,
  joinBudgetWithShareCode,
  updateProfile,
  changePassword,
  logout,
  startBackgroundSyncAfterLogin,
} from "../authService";
import { encryptionUtils } from "@/utils/platform/security/encryption";

// Mock dependencies
vi.mock("@/utils/platform/security/encryption", () => ({
  encryptionUtils: {
    deriveKey: vi.fn(),
    generateKey: vi.fn(),
    decrypt: vi.fn(),
    encrypt: vi.fn(),
    generateBudgetId: vi.fn(),
  },
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    auth: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    production: vi.fn(),
  },
}));

vi.mock("@/utils/core/common/sentry", () => ({
  identifyUser: vi.fn(),
}));

const mockStartSync = vi.fn();
const mockGetState = vi.fn();
vi.mock("@/stores/ui/uiStore", () => ({
  useBudgetStore: {
    getState: () => mockGetState(),
  },
}));

describe("authService", () => {
  const mockPassword = "password123";
  const mockSalt = new Uint8Array([1, 2, 3]);
  const mockIv = new Uint8Array([4, 5, 6]);
  const mockEncryptedData = "encrypted-bytes";
  const mockKey = { type: "secret", algorithm: { name: "AES-GCM" } } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("validatePassword", () => {
    it("should return true for valid password", async () => {
      localStorage.setItem(
        "envelopeBudgetData",
        JSON.stringify({
          salt: Array.from(mockSalt),
          encryptedData: mockEncryptedData,
          iv: Array.from(mockIv),
        })
      );

      (encryptionUtils.deriveKey as any).mockResolvedValue({ key: mockKey });
      (encryptionUtils.decrypt as any).mockResolvedValue({ budgetId: "test" });

      const isValid = await validatePassword(mockPassword);
      expect(isValid).toBe(true);
      expect(encryptionUtils.deriveKey).toHaveBeenCalledWith(mockPassword);
    });

    it("should return false if no data is stored", async () => {
      const isValid = await validatePassword(mockPassword);
      expect(isValid).toBe(false);
    });

    it("should return false for invalid password (decryption fails)", async () => {
      localStorage.setItem(
        "envelopeBudgetData",
        JSON.stringify({
          salt: [1],
          encryptedData: "...",
          iv: [1],
        })
      );
      (encryptionUtils.deriveKey as any).mockResolvedValue({ key: mockKey });
      (encryptionUtils.decrypt as any).mockRejectedValue(new Error("Decryption failed"));

      const isValid = await validatePassword(mockPassword);
      expect(isValid).toBe(false);
    });
  });

  describe("login - New User", () => {
    const mockUserData = { userName: "Alice", shareCode: "word1 word2 word3 word4" };

    it("should initialize budget data and profile for new user", async () => {
      (encryptionUtils.deriveKey as any).mockResolvedValue({ key: mockKey, salt: mockSalt });
      (encryptionUtils.generateBudgetId as any).mockResolvedValue("budget-123");
      (encryptionUtils.encrypt as any).mockResolvedValue({ data: "init-data", iv: [7, 8, 9] });

      const result = await login(mockPassword, mockUserData);

      expect(result.success).toBe(true);
      expect(result.isNewUser).toBe(true);
      expect(localStorage.getItem("userProfile")).toBeDefined();
      expect(localStorage.getItem("envelopeBudgetData")).toBeDefined();

      const savedData = JSON.parse(localStorage.getItem("envelopeBudgetData")!);
      expect(savedData.encryptedData).toBe("init-data");
    });

    it("should fail if share code is missing", async () => {
      const result = await login(mockPassword, { userName: "Alice" } as any);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Share code missing");
    });
  });

  describe("login - Existing User", () => {
    it("should login successfully if password is valid", async () => {
      localStorage.setItem(
        "envelopeBudgetData",
        JSON.stringify({
          salt: [1],
          encryptedData: "...",
          iv: [1],
        })
      );

      // Mock validation
      (encryptionUtils.deriveKey as any).mockResolvedValue({ key: mockKey, salt: mockSalt });
      (encryptionUtils.decrypt as any).mockResolvedValue({
        currentUser: { budgetId: "b1", shareCode: "sc", userName: "Bob" },
      });

      const result = await login(mockPassword);

      expect(result.success).toBe(true);
      expect(result.user.userName).toBe("Bob");
    });

    it("should offer new budget if no data found", async () => {
      const result = await login(mockPassword);
      expect(result.success).toBe(false);
      expect(result.code).toBe("NO_DATA_FOUND_OFFER_NEW_BUDGET");
    });
  });

  describe("updateProfile", () => {
    it("should update profile in localStorage and re-encrypt budget data", async () => {
      localStorage.setItem(
        "envelopeBudgetData",
        JSON.stringify({
          encryptedData: "old",
          iv: [1],
        })
      );

      const currentSession = { encryptionKey: mockKey, salt: mockSalt };
      const newProfile = { userName: "Updated", userColor: "red" };

      (encryptionUtils.decrypt as any).mockResolvedValue({ currentUser: { userName: "Old" } });
      (encryptionUtils.encrypt as any).mockResolvedValue({ data: "new", iv: [2] });

      const result = await updateProfile(newProfile as any, currentSession);

      expect(result.success).toBe(true);
      expect(JSON.parse(localStorage.getItem("userProfile")!).userName).toBe("Updated");
      expect(encryptionUtils.encrypt).toHaveBeenCalledWith(
        expect.objectContaining({ currentUser: newProfile }),
        mockKey
      );
    });
  });

  describe("changePassword", () => {
    it("should re-encrypt data with new key", async () => {
      localStorage.setItem(
        "envelopeBudgetData",
        JSON.stringify({
          encryptedData: "old-data",
          iv: [1],
        })
      );

      const newKey = { type: "new-secret" } as any;
      const newSalt = new Uint8Array([7, 8]);

      (encryptionUtils.deriveKey as any).mockResolvedValue({ key: mockKey });
      (encryptionUtils.decrypt as any).mockResolvedValue({ some: "data" });
      (encryptionUtils.generateKey as any).mockResolvedValue({ key: newKey, salt: newSalt });
      (encryptionUtils.encrypt as any).mockResolvedValue({ data: "new-data", iv: [9] });

      const result = await changePassword("old-pw", "new-pw");

      expect(result.success).toBe(true);
      const saved = JSON.parse(localStorage.getItem("envelopeBudgetData")!);
      expect(saved.encryptedData).toBe("new-data");
      expect(saved.salt).toEqual([7, 8]);
    });
  });

  describe("logout", () => {
    it("should clear userProfile but keep budget data", () => {
      localStorage.setItem("userProfile", "{}");
      localStorage.setItem("envelopeBudgetData", "{}");

      logout();

      expect(localStorage.getItem("userProfile")).toBeNull();
      expect(localStorage.getItem("envelopeBudgetData")).toBeDefined();
    });
  });

  describe("startBackgroundSyncAfterLogin", () => {
    it("should wait and then call startBackgroundSync if enabled", async () => {
      vi.useFakeTimers();

      mockGetState.mockReturnValue({
        cloudSyncEnabled: true,
        startBackgroundSync: mockStartSync,
      });

      const syncPromise = startBackgroundSyncAfterLogin(false);

      // Fast forward time
      vi.advanceTimersByTime(2500);
      await syncPromise;

      expect(mockStartSync).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it("should skip sync if cloudSyncEnabled is false", async () => {
      vi.useFakeTimers();
      mockGetState.mockReturnValue({
        cloudSyncEnabled: false,
        startBackgroundSync: mockStartSync,
      });
      mockStartSync.mockClear();

      const syncPromise = startBackgroundSyncAfterLogin(false);
      vi.advanceTimersByTime(2500);
      await syncPromise;

      expect(mockStartSync).not.toHaveBeenCalled();
      vi.useRealTimers();
    });
  });
});
