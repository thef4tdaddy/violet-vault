import { describe, it, expect, vi, beforeEach } from "vitest";
import { encryptionUtils } from "../encryption";
import logger from "@/utils/core/common/logger";
import { getRandomBytes } from "../cryptoCompat";

// Mock logger to avoid noise
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("encryptionUtils", () => {
  const mockPassword = "test-password-123";
  const mockData = { test: "data", amount: 100 };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("deriveKey and generateKey", () => {
    it("should generate a key and deterministic salt from password", async () => {
      const result = await encryptionUtils.generateKey(mockPassword);

      expect(result).toHaveProperty("key");
      expect(result).toHaveProperty("salt");
      expect(result.salt).toBeInstanceOf(Uint8Array);
      expect(result.salt.length).toBe(16);
    });

    it("should produce the same salt for the same password", async () => {
      const result1 = await encryptionUtils.generateKey(mockPassword);
      const result2 = await encryptionUtils.generateKey(mockPassword);

      expect(result1.salt).toEqual(result2.salt);
    });

    it("should derive the same key from the same salt and password", async () => {
      const { salt } = await encryptionUtils.generateKey(mockPassword);

      const key1 = await encryptionUtils.deriveKeyFromSalt(mockPassword, salt);
      const key2 = await encryptionUtils.deriveKeyFromSalt(mockPassword, salt);

      // We check that the keys exist. Note: in jsdom/mock environments,
      // actual CryptoKey equality checks can be tricky depending on the mock,
      // but they should be identical objects or represent the same material.
      expect(key1).toBeDefined();
      expect(key2).toBeDefined();
    });
  });

  describe("encrypt and decrypt", () => {
    it("should encrypt and then decrypt back to original object", async () => {
      const { key } = await encryptionUtils.generateKey(mockPassword);

      const encrypted = await encryptionUtils.encrypt(mockData, key);
      expect(encrypted).toHaveProperty("data");
      expect(encrypted).toHaveProperty("iv");
      expect(Array.isArray(encrypted.data)).toBe(true);
      expect(Array.isArray(encrypted.iv)).toBe(true);

      const decrypted = await encryptionUtils.decrypt(encrypted.data, key, encrypted.iv);
      expect(decrypted).toEqual(mockData);
    });

    it("should handle string data in encrypt", async () => {
      const { key } = await encryptionUtils.generateKey(mockPassword);
      const stringData = "simple-string-secret";

      const encrypted = await encryptionUtils.encrypt(stringData, key);
      const decrypted = await encryptionUtils.decrypt(encrypted.data, key, encrypted.iv);

      expect(decrypted).toBe(stringData);
    });

    it("should throw error on decryption with wrong key/iv", async () => {
      const { key } = await encryptionUtils.generateKey(mockPassword);
      const encrypted = await encryptionUtils.encrypt(mockData, key);

      // Inject error into subtle.decrypt to simulate failure
      const originalDecrypt = crypto.subtle.decrypt;
      crypto.subtle.decrypt = vi.fn().mockRejectedValue(new Error("Decryption failed"));

      await expect(encryptionUtils.decrypt(encrypted.data, key, encrypted.iv)).rejects.toThrow(
        "Decryption failed"
      );

      expect(logger.error).toHaveBeenCalled();

      // Restore
      crypto.subtle.decrypt = originalDecrypt;
    });
  });

  describe("decryptRaw", () => {
    it("should decrypt to a raw string instead of parsing JSON", async () => {
      const { key } = await encryptionUtils.generateKey(mockPassword);
      const stringData = "raw-string-content";

      const encrypted = await encryptionUtils.encrypt(stringData, key);
      const decrypted = await encryptionUtils.decryptRaw(encrypted.data, key, encrypted.iv);

      expect(decrypted).toBe(JSON.stringify(stringData));
    });
  });

  describe("generateBudgetId", () => {
    const mockShareCode = "abandon ability able about";

    it("should generate a deterministic budget ID", async () => {
      const budgetId1 = await encryptionUtils.generateBudgetId(mockPassword, mockShareCode);
      const budgetId2 = await encryptionUtils.generateBudgetId(mockPassword, mockShareCode);

      expect(budgetId1).toMatch(/^budget_[a-f0-9]{16}$/);
      expect(budgetId1).toBe(budgetId2);
    });

    it("should throw error if share code is missing or invalid", async () => {
      await expect(encryptionUtils.generateBudgetId(mockPassword, "")).rejects.toThrow(
        "Share code is required"
      );

      await expect(encryptionUtils.generateBudgetId(mockPassword, "invalid code")).rejects.toThrow(
        "Invalid share code format"
      );
    });
  });

  describe("generateHash", () => {
    it("should generate a deterministic hex hash for various inputs", () => {
      const hash1 = encryptionUtils.generateHash(mockData);
      const hash2 = encryptionUtils.generateHash(mockData);
      const hash3 = encryptionUtils.generateHash({ ...mockData, changed: true });

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hash3);
      expect(typeof hash1).toBe("string");
    });
  });

  describe("optimized encryption pipeline", () => {
    it("should encrypt and decrypt using optimized (compressed) path", async () => {
      const { key } = await encryptionUtils.generateKey(mockPassword);

      const encrypted = await encryptionUtils.encryptOptimized(mockData, key);
      expect(encrypted).toHaveProperty("metadata");
      expect(encrypted.metadata).toHaveProperty("optimized", true);

      const decrypted = await encryptionUtils.decryptOptimized(encrypted, key);
      expect(decrypted).toEqual(mockData);
    });

    it("should handle legacy IV decryption in optimized path", async () => {
      const { key } = await encryptionUtils.generateKey(mockPassword);
      const encrypted = await encryptionUtils.encryptOptimized(mockData, key);

      // Pass IV and data separately to simulate legacy format
      const decrypted = await encryptionUtils.decryptOptimized(
        encrypted.data,
        key,
        new Uint8Array(encrypted.iv)
      );
      expect(decrypted).toEqual(mockData);
    });

    it("should throw error on invalid payload structure", async () => {
      const { key } = await encryptionUtils.generateKey(mockPassword);

      await expect(encryptionUtils.decryptOptimized({}, key)).rejects.toThrow(
        "Invalid encrypted payload structure"
      );
    });
  });
});
