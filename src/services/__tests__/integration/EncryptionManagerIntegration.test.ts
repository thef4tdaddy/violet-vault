import { describe, it, expect, beforeEach } from "vitest";
import { encryptionManager } from "../../security/encryptionManager";

describe("EncryptionManager Integration Tests", () => {
  const testPassword = "test-strong-password-123";
  const testData = {
    id: "budget_123",
    envelopes: [
      { id: "env_1", name: "Groceries", balance: 500 },
      { id: "env_2", name: "Rent", balance: 1200 },
    ],
    metadata: {
      version: "2.0",
      timestamp: Date.now(),
    },
  };

  beforeEach(async () => {
    // Reset singleton if possible or ensure fresh state
  });

  it("should derive a deterministic key from a password", async () => {
    const { key, salt } = await encryptionManager.deriveKey(testPassword);

    expect(key).toBeDefined();
    expect(salt).toBeDefined();
    expect(salt.length).toBe(16);
    expect(key.algorithm.name).toBe("AES-GCM");

    // Verify determinism
    const result2 = await encryptionManager.deriveKey(testPassword);
    expect(Array.from(new Uint8Array(await crypto.subtle.exportKey("raw", key)))).toEqual(
      Array.from(new Uint8Array(await crypto.subtle.exportKey("raw", result2.key)))
    );
  });

  it("should encrypt and decrypt data correctly (Optimized/Compressed)", async () => {
    const { key } = await encryptionManager.deriveKey(testPassword);
    encryptionManager.setKey(key);

    const encrypted = await encryptionManager.encrypt(testData);
    expect(encrypted.data).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.metadata.optimized).toBe(true);

    const decrypted = await encryptionManager.decrypt<typeof testData>(encrypted);
    expect(decrypted).toEqual(testData);
  });

  it("should handle large datasets with compression", async () => {
    const { key } = await encryptionManager.deriveKey(testPassword);
    encryptionManager.setKey(key);

    const largeData = {
      transactions: Array.from({ length: 1000 }, (_, i) => ({
        id: `tx_${i}`,
        amount: Math.random() * 100,
        note: "This is a recurring transaction test for compression efficiency",
      })),
    };

    const encrypted = await encryptionManager.encrypt(largeData);

    // Check that compression actually worked (ratio > 1)
    expect(encrypted.metadata.compressionRatio).toBeGreaterThan(1);

    const decrypted = await encryptionManager.decrypt<typeof largeData>(encrypted);
    expect(decrypted.transactions).toHaveLength(1000);
    expect(decrypted).toEqual(largeData);
  });

  it("should generate a deterministic budget ID", async () => {
    const shareCode = "abandon abandon abandon abandon";
    const budgetId1 = await encryptionManager.generateBudgetId(testPassword, shareCode);
    const budgetId2 = await encryptionManager.generateBudgetId(testPassword, shareCode);

    expect(budgetId1).toBe(budgetId2);
    expect(budgetId1.startsWith("budget_")).toBe(true);
    expect(budgetId1.length).toBe(23); // budget_ + 16 hex chars
  });
});
